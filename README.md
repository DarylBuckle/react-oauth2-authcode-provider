# react-oauth2-authcode-provider

> A component that can wrap react single page applications to implement authentication with OAuth2 Authorization Code Flow.

[![NPM](https://img.shields.io/npm/v/react-oauth2-authcode-provider.svg)](https://www.npmjs.com/package/react-oauth2-authcode-provider) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Contents

* [About](#about)
* [Install](#install)
* [Usage](#usage)
* [Props](#props)
  * [AuthCodeProvider properties](#authcodeprovider-properties)
  * [AuthCodeProps properties](#authcodeprops-properties)
* [Functions](#functions)
* [License](#license)

<br/>

## About

Wrap a single page react application with the AuthCodeProvider component to easily handle authentication with an OAuth2 server using Authorization Code flow for all pages, using just a few lines of code.

AuthCodeProvider can also be added to individual pages or react components to only require authentication for particular areas of an application.

A set of functions included in AuthCodeFunctions can also be used to initiate flows, get tokens, or sign requests.

Also includes Refresh token flow, and token management and logout flow.


## Install

```bash
npm install --save react-oauth2-authcode-provider
```

Peer Dependencies;
* React v16 +
* [Axios](https://github.com/axios/axios) v0.19 +

## Usage

Minimum required;

```tsx
import React, { Component } from 'react'

import AuthCodeProvider from 'react-oauth2-authcode-provider'
import 'react-oauth2-authcode-provider/dist/index.css'

class Example extends Component {
  render() {
    return 
      <AuthCodeProvider 
        authenticationProps={{
          authUrl: 'https://yourauthserver.com/authorize',
          callBackPath: '/callbackpath',
          tokenUrl: 'https://yourauthserver.com/token',
          clientId: 'your_client_id',
          clientSecret: 'your_client_secret',
          scope: 'somescope offline_access'
        }}
      >
        <div>Your app will go here</div>
      </AuthCodeProvider>
  }
}
```

See the [Examples](./example) for an application of this component. This showcases a few different use cases all in one single page application, and you can see this in action whilst hooked up to a test Auth0 server.

Build the Examples with `npm install` and then `npm start` to start the development server at [http://localhost:3000](http://localhost:3000).

Or view the online example at [https://darylbuckle.github.io/react-oauth2-authcode-provider](https://darylbuckle.github.io/react-oauth2-authcode-provider).

A simple example that always requires authentication can also be found at [https://github.com/darylbuckle/react-oauth2-authcode-provider-test](https://github.com/darylbuckle/react-oauth2-authcode-provider-test).



## Props

##### AuthCodeProvider properties

| Property | Type | Default | Mandatory | Description |
| -------- |------| --------| ----------| ------------|
|    authenticationProps | AuthCodeProps  |  | true | An instance of the AuthCodeAuthentication class. This contains properties needed to for the authentication flow. |
|    authenticationRequired | bool  | true | false | A prop used to toggle whether authentication is required. If false children will be rendered. If true, children will only be rendered when authenticated. Changing from false to true can be used to start the authentication flow. |
|    doLogout | bool  | false  | false | A prop used to begin the logout flow. Changing from false to true can be used to start the logout flow. |
|    returnTo | string  | *current path*  | false | Once a token has been retrieved this is the path to redirect back to. If not set it will redirect back to the current path. |
|    history | ReactRouterHistory  |  | false | React router history object. If set this will be used for post authentication redirects and removing the code parameter. If not provided the page will be reloaded to remove the code parameter and redirect. |
|    storagePrefix | string  | ''  | false | Used if you are authenticating with multiple oauth2 servers, you can store multiple access tokens. The second/third/etc instance should have a unique prefixes. |
|    cookiePath | string  | '/'  | false | Determines the Path for cookies. If hosting in a subdirectory you should set this to the subdirectory path (/subdriectory). |
|    onGetAuthCode | func  |  | false | A call back function that is called before being redirecting to the authorization endpoint. |
|    onReceiveAuthCode | func  |  | false | A call back function that is called when redirected back to the application with the Code parameter populated. |
|    onTokenObtained | func  |  | false | A call back function that is called after retrieving an access token. |
|    onTokenObtainedError | func  |  | false | A call back function that is called if there is an error retrieving an access token. |
|    onTokenRefreshed | func  |  | false | A call back function that is called after retrieving an access token from a refresh token in the background. |
|    onTokenRefreshedError | func  |  | false | A call back function that is called if there is an error retrieving access token from a refresh token in the background. |
|    enableDebugLog | bool  | false  | false | Set to true to allow additional logging to the console. |
|    signInText | string  | 'Signing you in'  | false | The label 'Signing you in'  |
|    signInText | string  | 'Signing you out'  | false | The label 'Signing you out' |
|    signInText | string  | 'Sorry, we were unable to sign you in. Please try again later.'  | false | The label 'Sorry, we were unable to sign you in. Please try again later.' |
|    signInText | string  | 'Your session has expired.\nSign in again to continue.'  | false | The label 'Your session has expired.\nSign in again to continue.' |
|    loaderComponent | JSX.Element  |   | false | You can use this prop to override the Loader with your own component. The component must support the props: text<string>. |
|    signInErrorComponent | JSX.Element  |   | false | You can use this prop to override the Sign in error message with your own component. The component must support the props: text<string>, btnText<string>, onBtnClick<function>. |


<br/>


##### AuthCodeProps properties

| Property | Type | Default | Mandatory | Description |
| -------- |------| --------| ----------| ------------|
|    authUrl | string  |  | true | Url of the authentication endpoint of the authentication server (login screen) |
|    callBackPath | string  | ''  | false | Local path to redirect back to after authenticating |
|    tokenUrl | string  |  | true | Url of the token endpoint of the authentication server |
|    logoutUrl | string  |  | false | Url of the logout endpoint of the authentication server |
|    logoutCallBackPath | string  |  | false | Local path to redirect back to after logging out |
|    clientId | string  |  | true | Your applications Client Id |
|    clientSecret | string  |  | false | Your applications Client Secret if applicable |
|    scope | string  | '' | false | Scope to request |
|    usePkce | boolean  | true | false | Enable proof key for code exchange (security) |
|    useState | boolean  | true | false | Enable state matching (security) |
|    useNonce | boolean  | true | false | Enable nonce matching (security) |

<br/>

## Functions

The following functions can be imported from AuthCodeFunctions.

| Function | Returns | Description
| --------| ----------| ------------|
|    isLoggedIn  |  boolean | Returns true if there is a an access_token or refresh_token cookie present (IE. authorization has been completed) |
|    hasTokenExpired  |  boolean | Determines if the current access_token is still valid (2 minute leeway) |
|    hasAccessToken  |  boolean | Returns true if there is an access token cookie present |
|    accessToken  |  string | Returns the access_token which is saved as a cookie |
|    hasRefreshToken  |  boolean | Returns true if there is a refresh token cookie present |
|    refreshToken  |  string | Returns the refresh_token which is saved as a cookie |
|    signRequest  |  object | Adds Authorization = 'Bearer access_token' to request headers if an access_token is present |
|    doAuthorizationCodeFlow  |  void | Begins authorization by redirecting to the authorization endpoint of the authentication server |
|    doLogoutFlow  |  void | Begins logout by redirecting to the logout endpoint of the authentication server |
|    base64URLEncode  |  string | base64 encodes a url |
|    sha256  |  string | sha256 encodes a string |
|    getURIParameterByName  |  string | Gets the value of a uri parameter |
|    parseJwt  |  string | Decode Jwt to json string |


<br/>

## License

MIT © [DarylBuckle](https://github.com/DarylBuckle) 2020
