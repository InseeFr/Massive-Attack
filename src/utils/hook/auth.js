import { useIsAuthenticated } from 'utils/authentication/useAuth';
import { useEffect, useState } from 'react';
import {
  LOC_STOR_USER_KEY,
  GUEST_USER,
  LOC_STOR_AUTH_MODE_KEY,
  LOC_STOR_ADMIN_ROLE,
  LOC_STOR_USER_ROLE,
} from 'utils/constants';

export const useAuth = () => {
  const { tokens, isAuthenticated } = useIsAuthenticated();
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

  const anyMatch = (checkedRoles, targetRoles) => {
    console.log({ checkedRoles, targetRoles });
    return checkedRoles.filter(r => targetRoles.includes(r)).length > 0;
  };

  useEffect(() => {
    const authenticationMode = window.localStorage.getItem(LOC_STOR_AUTH_MODE_KEY);
    const adminRole = window.localStorage.getItem(LOC_STOR_ADMIN_ROLE);
    const userRole = window.localStorage.getItem(LOC_STOR_USER_ROLE)?.split(',') ?? [];
    console.log(userRole);
    switch (authenticationMode) {
      case 'anonymous':
        window.localStorage.setItem(LOC_STOR_USER_KEY, JSON.stringify(GUEST_USER));
        accessAuthorized();
        setIsAdmin(true);
        break;

      case 'oidc':
        console.log({ isAuthenticated, tokens });
        if (isAuthenticated) {
          const userToken = tokens.decodedIdToken;
          const userInfo = {
            firstName: userToken.given_name,
            lastName: userToken.family_name,
            id: userToken.preferred_username,
            roles: userToken.groups,
          };
          console.log(userToken);
          console.log(userInfo);

          if (anyMatch(userInfo.roles, [...userRole, adminRole])) {
            accessAuthorized();
            setIsAdmin(anyMatch(tokens.decodedIdToken.groups, [adminRole]));
            window.localStorage.setItem(LOC_STOR_USER_KEY, JSON.stringify(userInfo));
          } else {
            accessDenied();
          }
        } else {
          accessDenied();
        }
        break;
      default:
    }
  }, [isAuthenticated, tokens]);
  return { authenticated, isAdmin, pending, tokens };
};
