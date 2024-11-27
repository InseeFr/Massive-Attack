import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app/App';

import {
  LOC_STOR_API_URL_KEY,
  LOC_STOR_AUTH_MODE_KEY,
  LOC_STOR_PLATFORM_KEY,
  LOC_STOR_ADMIN_ROLE,
} from 'utils/constants';
import { initializeOidc } from './utils/authentication/useAuth';

async function main() {
  // Load OIDC configuration
  const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
  const response = await fetch(`${publicUrl.origin}/configuration.json`);
  const configuration = await response.json();

  // store configuration locally
  window.localStorage.setItem(LOC_STOR_AUTH_MODE_KEY, configuration.AUTHENTICATION_MODE);
  window.localStorage.setItem(LOC_STOR_API_URL_KEY, configuration.MASSIVE_ATTACK_API_URL);
  window.localStorage.setItem(LOC_STOR_PLATFORM_KEY, configuration.PLATEFORM);
  window.localStorage.setItem(LOC_STOR_ADMIN_ROLE, configuration.ADMIN_ROLE);

  // Initialize OIDC globally to use it later
  const { OidcProvider } = initializeOidc({
    issuerUri: configuration.ISSUER_URI,
    clientId: configuration.OIDC_CLIENT_ID,
    publicUrl: '/',
  });

  ReactDOM.render(
    <React.StrictMode>
      <OidcProvider>
        <App />
      </OidcProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

main();
