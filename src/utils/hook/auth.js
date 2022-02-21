import { GUEST_USER, LOCALE_STORAGE_USER_KEY } from './../constants';
import { getTokenInfo, keycloakAuthentication } from './../keycloak';
import { useEffect, useState } from 'react';

// import useInterval from './useInterval';

export const useAuth = () => {
  const [authenticated, setAuthenticated] = useState(false);
  // const refreshFunction = useRef(() => {});
  // useInterval(refreshFunction.current, 60000);

  // const kcRefresh = () => refreshToken(-1);

  const authorizedRoles = ['manager', 'uma_authorization', 'Guest'];

  const accessAuthorized = () => {
    setAuthenticated(true);
  };

  const accessDenied = () => {
    setAuthenticated(false);
  };

  const isAuthorized = roles => roles.filter(r => authorizedRoles.includes(r)).length > 0;

  useEffect(() => {
    const configURL = `${window.location.origin}/configuration.json`;
    fetch(configURL)
      .then(response => response.json())
      .then(data => {
        switch (data.AUTHENTICATION_MODE) {
          case 'anonymous':
            window.localStorage.setItem(LOCALE_STORAGE_USER_KEY, JSON.stringify(GUEST_USER));
            accessAuthorized();
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
                    if (isAuthorized(roles)) {
                      window.localStorage.setItem(
                        LOCALE_STORAGE_USER_KEY,
                        JSON.stringify(userInfos)
                      );
                      // refreshFunction.current = kcRefresh;
                      accessAuthorized();
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
  });
  return { authenticated };
};
