import { useEffect } from 'react';
import { createReactOidc } from 'oidc-spa/react';

/**
 * By default, without initialization we use a mock as a return of "useOidc"
 *
 * This object will be used for testing purpose to simulate authentication status
 */
const mockOidc = { login: () => {}, isUserLoggedIn: false, oidcTokens: {} };
// Global method that will be replaced when oidc is initialized
let useOidc = ({ assertUserLoggedIn }) => mockOidc;

/**
 * Helper method used for tests, set a fake Oidc authentication state
 */
export const mockOidcForUser = () => {
  window.localStorage.setItem('AUTHENTICATION_MODE', 'oidc');
  mockOidc.isUserLoggedIn = true;
  mockOidc.oidcTokens = { accessToken: '12031203' };
};
export const mockOidcFailed = () => {
  mockOidc.isUserLoggedIn = false;
  mockOidc.oidcTokens = {};
};

/**
 * Initialize oidc
 */
export function initializeOidc(config) {
  const oidc = createReactOidc(config);
  useOidc = oidc.useOidc;
  return oidc;
}

/**
 * Retrieve authentication status based of Oidc
 */
export function useIsAuthenticated() {
  const { login, isUserLoggedIn, oidcTokens } = useOidc({ assertUserLoggedIn: false });

  useEffect(() => {
    if (!login) {
      return;
    }
    login({
      doesCurrentHrefRequiresAuth: true,
    });
  }, [login]);

  return { isAuthenticated: isUserLoggedIn, tokens: oidcTokens };
}
