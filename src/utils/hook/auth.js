import { GUEST_USER, LOCALE_STORAGE_USER_KEY } from './../constants';
import { getTokenInfo, keycloakAuthentication } from './../keycloak';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [pending, setPending] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const accessAuthorized = () => {
    setAuthenticated(true);
    setPending(false);
  };

  const accessDenied = () => {
    setAuthenticated(false);
    setPending(false);
  };

  const anyMatch = (checkedRoles, targetRoles) =>
    checkedRoles.filter(r => targetRoles.includes(r)).length > 0;

  useEffect(() => {
    const configURL = `${window.location.origin}/configuration.json`;
    if (pending) {
      fetch(configURL)
        .then(response => response.json())
        .then(data => {
          switch (data.AUTHENTICATION_MODE) {
            case 'anonymous':
              window.localStorage.setItem(LOCALE_STORAGE_USER_KEY, JSON.stringify(GUEST_USER));
              accessAuthorized();
              setIsAdmin(true);
              break;

            case 'keycloak':
              if (!authenticated) {
                keycloakAuthentication({
                  onLoad: 'login-required',
                  checkLoginIframe: false,
                })
                  .then(auth => {
                    if (auth) {
                      const userInfos = getTokenInfo();
                      const { roles } = userInfos;
                      if (anyMatch(roles, [...data.USER_ROLES, data.ADMIN_ROLE])) {
                        window.localStorage.setItem(
                          LOCALE_STORAGE_USER_KEY,
                          JSON.stringify(userInfos)
                        );
                        accessAuthorized();
                        setIsAdmin(anyMatch(roles, [data.ADMIN_ROLE]));
                      } else {
                        accessDenied();
                      }
                    } else {
                      accessDenied();
                    }
                  })
                  .catch(() => accessDenied());
              }
              break;
            default:
          }
        });
    }
  });
  return { authenticated, isAdmin, pending };
};
