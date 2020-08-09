import React, { useState } from 'react'
import {
  Switch,
  Route,
  Link,
  withRouter
} from 'react-router-dom'
import { AuthCodeProvider, AuthCodeFunctions, AuthCodeAuthenticationProperties } from 'react-oauth2-authcode-provider'
import 'react-oauth2-authcode-provider/dist/index.css'

const App = (props: any) => {
  const [authRequired, setAuthRequired] = useState(false);
  const [, setTokenLoaded] = useState<any>(null);
  const [doLogout, setDoLogout] = useState(false);
  const loggedIn = AuthCodeFunctions.isLoggedIn()
  const authProps: AuthCodeAuthenticationProperties = {
    authUrl: 'https://dev-emf33n24.eu.auth0.com/authorize',
    callBackPath: '/callback',
    tokenUrl: 'https://dev-emf33n24.eu.auth0.com/oauth/token',
    logoutUrl: 'https://dev-emf33n24.eu.auth0.com/v2/logout',
    logoutCallBackPath: '/',
    clientId: '0ujnTs1Uynm6W83ygzbkuRkMhqdTrZ26',
    clientSecret: 'DhYAsb9z9LxMDsZL3shPFaB90sCSqMptPaMU-EnB7fEUv-ECbMjqlvn6nQTOVoLG',
    scope: 'openid profile email phone address offline_access',
    usePkce: true,
    useState: true,
    useNonce: true
  }

  let username = ''
  const idToken = localStorage.getItem('id_token')
  if (idToken) {
    try { 
      const idTokenObj = JSON.parse(AuthCodeFunctions.parseJwt(idToken))
      if (idTokenObj){
        username = idTokenObj.name
      } 
    } catch (e) {
      /*invalid json*/
    };
  }

  const loginstatus = 
    <div>
      {'You '}
      <b>{loggedIn ? 'are' : 'are not'}</b>
      {' logged in'}
      <b>{loggedIn && username ? ' as ' + username : ''}</b>
      {'.'}
    </div>

  const pageinfo = 
    <div className="mt-5 mb-5">
      <p>
        These examples use a example Auth0 authorization server.
      </p>
      <p>
        The <b>No Auth page</b> does not require you to be logged in to access.
        You can initiate the OAuth2 Authorisation code flow by selecting the login button though.
        <br/>
        It uses the AuthCodeProvider component with authenticationRequired = the state of whether the loggin button has been pressed.
      </p>
      <p>
        The <b>Auth Required page</b> requires you to be logged in to access.
        Browsing too this page will initiate the OAuth2 Authorisation code flow if you are not already logged in.
        You can also use this implentation to require authentication for the whole application.
        <br/>
        It uses the AuthCodeProvider component with authenticationRequired = true.
      </p>
      <p>
        The <b>Functions page</b> has alternate methods to begin the Authorisation code or Logout flows.
        These methods use Functions to intiate the flow instead of parsing props to AuthCodeProvider.
        This is useful for starting the flows in deep nested components instead of passing variables up the stack.
      </p>
    </div>
  
  return (
    <div>
      <nav className='navbar navbar-expand-lg navbar-dark bg-secondary fixed-top'>
          <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'>
              <span className='navbar-toggler-icon'></span>
          </button>
          <div style={{width:'100%'}}>
            <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                <ul className='navbar-nav ml-lg-5' data-toggle='collapse' data-target='.navbar-collapse.show'>
                    <li className='nav-item mr-lg-3'>
                        <Link className={props.location.pathname === '/' ? 'nav-link active' : 'nav-link'} to='/'>No Auth</Link>
                    </li>
                    <li className='nav-item mr-lg-3'>
                        <Link className={props.location.pathname === '/authrequired' ? 'nav-link active' : 'nav-link'} to='/authrequired'>Auth Required</Link>
                    </li>
                    <li className='nav-item mr-lg-3'>
                        <Link className={props.location.pathname === '/manual' ? 'nav-link active' : 'nav-link'} to='/functions'>Functions</Link>
                    </li>
                </ul>

                <ul className='navbar-nav ml-auto mr-lg-5' data-toggle='collapse' data-target='.navbar-collapse.show'>
                    { loggedIn ? 
                    <li className='nav-item mr-lg-3'>
                        <button className='nav-link btn btn-link' onClick={() => setDoLogout(true)}>Logout</button>
                    </li>
                    :
                    <li className='nav-item mr-lg-3'>
                        <button className='nav-link btn btn-link' onClick={() => setAuthRequired(true)}>Login</button>
                    </li>
                    }
                </ul>
            </div>
          </div>
      </nav>
      <div className='ml-lg-5 ml-3 mr-lg-5 mr-3' style={{marginTop: '100px'}}>
          <h1 className='mb-3'>react-oauth2-authcode-provider examples</h1>
          <Switch>
            <Route exact path='/'>
              <AuthCodeProvider
                authenticationProps={authProps}
                history={props.history}
                authenticationRequired={authRequired}
                doLogout={doLogout}
                enableDebugLog={true}
                onTokenObtained={(data) => setTokenLoaded(data)}
                onTokenObtainedError={(error) => { setTokenLoaded(error)}}
              >
                <span style={{fontStyle: 'italic'}}>
                  This page does not require you to be logged in, but you can log in with the login button on the nav bar.
                </span>
                {loginstatus}
                {pageinfo}
              </AuthCodeProvider>
            </Route>
            <Route exact path='/functions'>
              <AuthCodeProvider
                authenticationProps={authProps}
                history={props.history}
                authenticationRequired={false}
                enableDebugLog={true}
                onTokenObtained={(data) => setTokenLoaded(data)}
                onTokenObtainedError={(error) => { setTokenLoaded(error)}}
              >
                <span style={{fontStyle: 'italic'}}>
                  This page has functions to manually initiate the Authorisation code flow or logout flow using functions.
                </span>
                {loginstatus}
                <div className='mt-3 mb-3'>
                  <button className='btn btn-primary mr-3' onClick={() => AuthCodeFunctions.doAuthorisationCodeFlow(authProps)}>Start Authorisation Code Flow</button>
                  <button className='btn btn-primary mr-3' onClick={() => AuthCodeFunctions.doLogoutFlow(authProps)}>Start Log out Flow</button>
                </div>
                {pageinfo}
              </AuthCodeProvider>
            </Route>
            <Route exact path='*'>
              <AuthCodeProvider
                authenticationProps={authProps}
                history={props.history}
                authenticationRequired={true}
                doLogout={doLogout}
                enableDebugLog={true}
                onTokenObtained={(data) => setTokenLoaded(data)}
                onTokenObtainedError={(error) => setTokenLoaded(error)}
              >
                <Switch>
                  <Route path='/authrequired'>
                    <span style={{fontStyle: 'italic'}}>
                      This page requires you to be logged in. It's content only shows when you are logged in.
                    </span>
                    {loginstatus}
                    {pageinfo}
                  </Route>
                  <Route path='/callback'>
                    {/* callback route */}
                  </Route>
                </Switch>
              </AuthCodeProvider>
            </Route>
          </Switch>
      </div>
    </div>
  )

}

export default withRouter(App)
