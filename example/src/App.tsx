import React, { useState } from 'react'
import {
  Switch,
  Route,
  Link,
  withRouter
} from 'react-router-dom'
import { AuthCodeProvider, AuthCodeFunctions, AuthCodeProps } from 'react-oauth2-authcode-provider'
import 'react-oauth2-authcode-provider/dist/index.css'
import FunctionsPage from './FunctionsPage'

const App = (props: any) => {
  const [authRequired, setAuthRequired] = useState(false)
  const [doLogout, setDoLogout] = useState(false)
  const [, setTokenLoaded] = useState<any>(null) // This is being used to refresh the nav bar on sign in status change

  const authProps: AuthCodeProps = {
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

  const loggedIn = AuthCodeFunctions.isLoggedIn()
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
    <div className='mt-4 mb-5'>
      <hr className='mb-4' />
      <p>
        These examples use a example Auth0 authorization server.
      </p>
      <div className='row'>
        <div className="col-lg-4">
          <div className="card h-100 m-1">
            <div className="card-body">
              <p>
                The <b>No Auth page</b> does not require you to be logged in to access.
                You can initiate the OAuth2 Authorization code flow by selecting the login button though.
              </p>
              <p>
                It uses the AuthCodeProvider component with authenticationRequired = the state of whether the loggin button has been pressed.
              </p>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card h-100 m-1">
            <div className="card-body">
              <p>
                The <b>Auth Required page</b> requires you to be logged in to access.
                Browsing too this page will initiate the OAuth2 Authorization code flow if you are not already logged in.
              </p>
              <p>
                It uses the AuthCodeProvider component with authenticationRequired = true.
              </p>
              <p>
                You can also use this implentation to require authentication for the whole application.
                To require authentication for the whole application, render a single instance of AuthCodeProvider in a top level component (E.g App).
              </p>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card h-100 m-1">
            <div className="card-body">
              <p>
                The <b>Functions page</b> has alternate methods to begin the Authorization code or Logout flows.
                These methods use Functions to intiate the flow instead of parsing props to AuthCodeProvider.
                This is useful for starting the flows in deep nested components instead of passing variables up the stack.
              </p>
            </div>
          </div>
        </div>
      </div>
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
                        <Link className={props.location.pathname === '/functions' ? 'nav-link active' : 'nav-link'} to='/functions'>Functions</Link>
                    </li>
                </ul>

                { props.location.pathname === '/functions' ? '' :
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
                }
            </div>
          </div>
      </nav>
      <div className='ml-lg-5 ml-3 mr-lg-5 mr-3' style={{marginTop: '100px'}}>
          <h1 className='mb-3'>react oauth2 authcode provider examples</h1>
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
                <h3>No Auth</h3>
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
                <h3>Functions</h3>
                <span style={{fontStyle: 'italic'}}>
                  This page has functions to manually initiate the Authorization code flow or logout flow using functions.
                </span>
                {loginstatus}
                <FunctionsPage authProps={authProps} />
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
                    <h3>Auth Required</h3>
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
