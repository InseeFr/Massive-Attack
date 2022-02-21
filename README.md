# Getting Started with Massive Attack
## _**Massive** **A**limentation for **T**ests, **T**raining, **A**nd **C**ollection **K**atas_
---
## Quick start

In the project directory, run  `yarn start`  
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
___
## Configuration

You can edit the configuration files.
### ___Application configuration___

Edit the public/configuration.json to change configuration. Configuration entries :
 - MASSIVE_ATTACK_API_URL : the URL used to GET scenarii and PU request
 - AUTHENTICATION_MODE : anonymous or keycloak

### ___Keycloak configuration___

Configuration entries :
 - realm : 	"my-realm"
 - auth-server-url : "https://my.auth.server/auth"
 - ssl-required	: "none"
 - resource	: "localhost-frontend" or dedicated resource
 - public-client : true
 - confidential-port: 0
