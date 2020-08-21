This example was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

It is linked to the react-oauth2-authcode-provider package in the parent directory for development purposes.

You can run `npm install` and then `npm start` to test your package.

#### Deploying to a Sub-directory

When deploying the examples to a subdirectory change the following;

index.tsx

```javascript
ReactDOM.render(<Router basename={'react-oauth2-authcode-provider'}><App /></Router>, document.getElementById('root'))
```

App.tsx

```javascript
const authProps: AuthCodeProps = {
    authUrl: 'https://dev-emf33n24.eu.auth0.com/authorize',
    callBackPath: '/react-oauth2-authcode-provider/',
    tokenUrl: 'https://dev-emf33n24.eu.auth0.com/oauth/token',
    logoutUrl: 'https://dev-emf33n24.eu.auth0.com/v2/logout',
    logoutCallBackPath: '/react-oauth2-authcode-provider/',
```

```javascript
<AuthCodeProvider
    authenticationProps={authProps}
    history={props.history}
    authenticationRequired={authRequired}
    doLogout={doLogout}
    enableDebugLog={true}
    onTokenObtained={(data) => setTokenLoaded(data)}
    onTokenObtainedError={(error) => { setTokenLoaded(error)}}
    returnTo={'/'}
    cookiePath={'/react-oauth2-authcode-provider'}
>
```

```javascript
<AuthCodeProvider
    authenticationProps={authProps}
    history={props.history}
    authenticationRequired={false}
    enableDebugLog={true}
    onTokenObtained={(data) => setTokenLoaded(data)}
    onTokenObtainedError={(error) => { setTokenLoaded(error)}}
    returnTo={'/functions'}
    cookiePath={'/react-oauth2-authcode-provider'}
>
```

```javascript
<AuthCodeProvider
    authenticationProps={authProps}
    history={props.history}
    authenticationRequired={true}
    doLogout={doLogout}
    enableDebugLog={true}
    onTokenObtained={(data) => setTokenLoaded(data)}
    onTokenObtainedError={(error) => setTokenLoaded(error)}
    returnTo={'/authrequired'}
    cookiePath={'/react-oauth2-authcode-provider'}
>
```

FunctionsPage.tsx

```javascript
      <div className='mt-3 mb-3'>x
        <button className='btn btn-primary mr-3' onClick={() => AuthCodeFunctions.doAuthorizationCodeFlow(props.authProps, '/functions')}>Start Authorization Code Flow</button>
        <button className='btn btn-primary mr-3' onClick={() => AuthCodeFunctions.doLogoutFlow(props.authProps)}>Start Log out Flow</button>
      </div>
```