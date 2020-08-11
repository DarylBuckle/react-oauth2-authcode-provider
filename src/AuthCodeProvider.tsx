import * as React from 'react'
import PropTypes from 'prop-types'
import Cookies from 'universal-cookie'
import axios from 'axios'
import * as AuthCodeFunctions from './AuthCodeFunctions'
// eslint-disable-next-line no-unused-vars
import AuthCodeProps from './AuthCodeProps'
import Loader from './AuthCodeLoader'
import Message from './AuthCodeMessage'

const cookies = new Cookies()
const qs = require('querystring')

interface IAuthCodeProviderProps {
  children?: any
  authenticationRequired?: boolean
  doLogout?: boolean
  authenticationProps: AuthCodeProps
  returnTo?: string
  history: any
  storagePrefix: string
  onGetAuthCode?: () => void
  onRecieveAuthCode?: (authcode: string) => void
  onTokenObtained?: (data: any) => void
  onTokenObtainedError?: (error: Error) => void
  onTokenRefreshed?: (data: any) => void
  onTokenRefreshedError?: (error: Error) => void
  enableDebugLog?: boolean
  signInText: string
  signOutText: string
  signInErrorText: string
  refreshErrorText: string
  loaderComponent?: (props: any) => JSX.Element
  signInErrorComponent?: (props: any) => JSX.Element
}

interface IAuthCodeProviderState {
  loading: boolean
  signinError: boolean
}

const initialState: IAuthCodeProviderState = {
  loading: true,
  signinError: false
}

class AuthCodeProvider extends React.Component<
  IAuthCodeProviderProps,
  IAuthCodeProviderState
> {
  static defaultProps = {
    authenticationRequired: true,
    doLogout: false,
    storagePrefix: '',
    enableDebugLog: false,
    signInText: 'Signing you in...',
    signOutText: 'Signing you out...',
    signInErrorText:
      'Sorry, we were unable to sign you in. Please try again later.',
    refreshErrorText: 'Your session has expired.\nSign in again to continue.'
  }

  static propTypes = {
    /**
     * A prop used to toggle whether authentication is required.
     * If false children will be rendered.
     * If true, children will only be rendered when authenticated.
     * Changing from false to true can be used to start the authentication flow.
     */
    authenticationRequired: PropTypes.bool,

    /**
     * A prop used to begin the logout flow.
     * Changing from false to true can be used to start the logout flow.
     */
    doLogout: PropTypes.bool,

    /**
     * An instance of the AuthCodeAuthentication class. This contains properties needed to for the authentication flow.
     */
    authenticationProps: PropTypes.object.isRequired,

    /**
     * Once a token has been retrieved this is the path to redirect back to. If not set it will redirect back to the current path.
     */
    returnTo: PropTypes.string,

    /**
     * React router history object. If set this will be used for post authentication redirects and removing the code parameter.
     * If not provided the page will be reloaded to remove the code parameter and redirect.
     */
    history: PropTypes.any,

    /**
     * Used if you are aythenticating with multiple oauth2 servers, you can store multiple access tokens.
     * The second/third/etc instance should have a unique prefixes.
     */
    storagePrefix: PropTypes.string,

    /**
     * A call back function that is called before being redirecting to the authorization endpoint.
     */
    onGetAuthCode: PropTypes.func,

    /**
     * A call back function that is called when redirected back to the application with the Code parameter populated.
     */
    onRecieveAuthCode: PropTypes.func,

    /**
     * A call back function that is called after retrieving an access token.
     */
    onTokenObtained: PropTypes.func,

    /**
     * A call back function that is called if there is an error retrieving an access token.
     */
    onTokenObtainedError: PropTypes.func,

    /**
     * A call back function that is called after retrieving an access token from a refresh token in the background.
     */
    onTokenRefreshed: PropTypes.func,

    /**
     * A call back function that is called if there is an error retrieving access token from a refresh token in the background.
     */
    onTokenRefreshedError: PropTypes.func,

    /**
     * Set to true to allow addiitonal logging to the console
     */
    enableDebugLog: PropTypes.bool,

    /**
     * The label 'Signing you in'
     */
    signInText: PropTypes.string,

    /**
     * The label 'Signing you out'
     */
    signOutText: PropTypes.string,

    /**
     * The label 'Sorry, we were unable to sign you in. Please try again later.'
     */
    signInErrorText: PropTypes.string,

    /**
     * The label 'Your session has expired.\nSign in again to continue.'
     */
    refreshErrorText: PropTypes.string,

    /**
     * You can use this prop to override the Loader with your own component.
     * The component must support the props: text<string>.
     */
    loaderComponent: PropTypes.any,

    /**
     * You can use this prop to override the Sign in error message with your own component.
     * The component must support the props: text<string>, btnText<string>, onBtnClick<function>.
     */
    signInErrorComponent: PropTypes.any
  }

  refreshTimer: any

  constructor(props: IAuthCodeProviderProps) {
    super(props)
    this.state = initialState
    this.retryAuth = this.retryAuth.bind(this)
  }

  componentDidMount() {
    if (this.props.doLogout) {
      this.doLogout()
    } else {
      this.processAuth(false)
    }
  }

  componentDidUpdate(prevProps: IAuthCodeProviderProps): void {
    if (this.props.doLogout && !prevProps.doLogout) {
      this.doLogout()
    } else if (
      this.props.authenticationRequired &&
      !prevProps.authenticationRequired
    ) {
      this.processAuth(false)
    }
  }

  componentWillUnmount() {
    // Clean up
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * Checks to see if any action is required to authenticate, and iniates it if neccessary.
   */
  private processAuth(isRefresh: boolean): void {
    this.debugit('Authentication Required')
    let tokenExpired: boolean = false
    const accessTokenExpiry: any = localStorage.getItem(
      this.props.storagePrefix + 'access_token_expiry'
    )
    if (accessTokenExpiry) {
      var now = new Date()
      const accessTokenExpiryDate = new Date(accessTokenExpiry)
      if (now >= accessTokenExpiryDate) {
        tokenExpired = true
      } else {
        const diffMs = accessTokenExpiryDate.valueOf() - now.valueOf()
        this.setTokenRefresh(diffMs)
      }
    }

    if (
      AuthCodeFunctions.hasAccessToken(this.props.storagePrefix) &&
      !tokenExpired
    ) {
      // We have an access token already, no need to do anything
      this.debugit(
        'Access token present and valid. Expiry = ' + accessTokenExpiry
      )
      if (this.state.loading) {
        this.setState({ loading: false })
      }
    } else if (AuthCodeFunctions.hasRefreshToken(this.props.storagePrefix)) {
      // We have a refresh token but no access token, use this to get a new access token
      this.debugit('Refresh token present. Feteching new access token')
      this.doRefreshFlow(isRefresh)
    } else if (isRefresh) {
      // Encountered an issue - display error
      this.sessionExpired()
    } else {
      const code = AuthCodeFunctions.getURIParameterByName(
        'code',
        window.location.href
      )
      if (code) {
        // We have an authentication code, trade for token
        this.debugit('Authentication code detected. Fetching token')
        if (this.props.onRecieveAuthCode != null) {
          this.props.onRecieveAuthCode(code)
        }
        this.tradeCodeForToken(code)
      } else if (this.props.authenticationRequired) {
        // We have nothing, time to get a code
        this.debugit('Redirecting to authoisation endpoint')
        this.getAuthCode()
      } else {
        // authentication not required
        this.setState({ loading: false })
      }
    }
  }

  /**
   * Iniates the logout flow
   */
  private doLogout(): void {
    AuthCodeFunctions.doLogoutFlow(
      this.props.authenticationProps,
      this.props.storagePrefix
    )
  }

  /**
   * Sets up redirect to the authorization endpoint
   * @param isretry set to true if this is the second/third/nth attempt after an error with the first
   */
  private getAuthCode(isretry: boolean = false): void {
    if (this.props.onGetAuthCode != null) {
      this.props.onGetAuthCode()
    }
    this.setState({ loading: true })
    AuthCodeFunctions.doAuthorizationCodeFlow(
      this.props.authenticationProps,
      this.props.returnTo,
      this.props.storagePrefix,
      isretry
    )
  }

  /**
   * Trade the Code in the uri for a token using by doing a post to the token endpoint
   * @param code the code from the code query string parameter
   */
  private tradeCodeForToken(code: string): void {
    const {
      tokenUrl,
      callBackPath,
      clientId,
      clientSecret,
      scope,
      usePkce,
      useState
    } = this.props.authenticationProps
    this.debugit('Code url: ' + window.location.href)

    if (useState) {
      const codeState = AuthCodeFunctions.getURIParameterByName(
        'state',
        window.location.href
      )
      const origState = localStorage.getItem(
        this.props.storagePrefix + 'authcode_state'
      )
      if (codeState !== origState) {
        const stateErr = 'State does not match'
        this.debugit(stateErr)
        console.log(stateErr)
        if (this.props.onTokenObtainedError != null) {
          this.props.onTokenObtainedError(new Error(stateErr))
        }
        this.setState({ signinError: true })
      } else {
        this.debugit('State matches ' + origState)
      }
      localStorage.removeItem(this.props.storagePrefix + 'authcode_state')
    }

    const params: any = {
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: AuthCodeFunctions.buildRedirectUri(callBackPath),
      scope: scope,
      code: code
    }
    if (clientSecret) {
      params.client_secret = clientSecret
    }
    if (scope) {
      params.scope = scope
    }

    if (usePkce) {
      const verifier = localStorage.getItem(
        this.props.storagePrefix + 'authcode_v'
      )
      if (verifier) {
        params.code_verifier = verifier
      }
    }

    axios
      .post(tokenUrl, qs.stringify(params), {
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
      .then((response: any) => {
        this.debugit('Access token response')
        this.debugit(response)
        if (!response.data || !response.data.access_token) {
          throw new Error('Access token not present in token response')
        }
        if (response.data.error) {
          throw new Error(response.data.error_description)
        }

        this.setTokens(response.data, false)

        if (this.props.onTokenObtained != null) {
          this.props.onTokenObtained(response.data)
        }
      })
      .catch((error: any) => {
        console.log(error)
        this.debugit('Access token error')
        this.debugit(error?.response)
        if (this.props.onTokenObtainedError != null) {
          this.props.onTokenObtainedError(error)
        }
        this.setState({ signinError: true })
      })
  }

  /**
   * Use the refresh token to obtain a new access token. Does a post to the token endpoints
   * @param isRefresh if this is happening in the background (not initial fetch)
   */
  private doRefreshFlow(isRefresh: boolean): void {
    const {
      tokenUrl,
      callBackPath,
      clientId,
      clientSecret,
      scope
    } = this.props.authenticationProps

    const params: any = {
      grant_type: 'refresh_token',
      client_id: clientId,
      redirect_uri: AuthCodeFunctions.buildRedirectUri(callBackPath),
      scope: scope,
      refresh_token: AuthCodeFunctions.refreshToken(this.props.storagePrefix)
    }
    if (clientSecret) {
      params.client_secret = clientSecret
    }
    if (scope) {
      params.scope = scope
    }

    axios
      .post(tokenUrl, qs.stringify(params), {
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
      .then((response: any) => {
        this.debugit('Refresh token response')
        this.debugit(response)
        if (!response.data || !response.data.access_token) {
          throw new Error('Access token not present in token response')
        }
        if (response.data.error) {
          throw new Error(response.data.error_description)
        }

        this.setTokens(response.data, true)

        if (!isRefresh) {
          if (this.props.onTokenObtained != null) {
            this.props.onTokenObtained(response.data)
          }
        } else {
          if (this.props.onTokenRefreshed != null) {
            this.props.onTokenRefreshed(response.data)
          }
        }
      })
      .catch((error: any) => {
        console.log(error)
        this.debugit('Refresh token error')
        this.debugit(error?.response)
        if (!isRefresh) {
          if (this.props.authenticationRequired) {
            this.setState({ signinError: true })
          } else {
            this.setState({ loading: false })
            cookies.remove(this.props.storagePrefix + 'refresh_token')
            localStorage.removeItem(this.props.storagePrefix + 'id_token')
          }
          if (this.props.onTokenObtainedError != null) {
            this.props.onTokenObtainedError(error)
          }
        } else {
          if (this.props.onTokenRefreshedError != null) {
            this.props.onTokenRefreshedError(error)
          }
        }
      })
  }

  /**
   * If token expires mid session, or refresh fails mid session, this is called to get the user to take action to re-authorize.
   */
  private sessionExpired(): void {
    var expiredresult = window.confirm(this.props.refreshErrorText)
    if (expiredresult) {
      this.retryAuth()
    } else {
      setTimeout(this.processAuth.bind(this, true), 60000)
    }
  }

  /**
   * Handles token endpoint response and saves tokens
   * @param response response from the token endpoint
   * @param isrefresh if this is happening in the background (not initial fetch)
   */
  private setTokens(response: any, isrefresh: boolean): void {
    // save id token in storage and check nonce
    const idToken = response.id_token
    if (idToken) {
      const origNonce = localStorage.getItem(
        this.props.storagePrefix + 'authcode_nonce'
      )
      if (this.props.authenticationProps.useNonce && origNonce) {
        const idTokenObj = JSON.parse(AuthCodeFunctions.parseJwt(idToken))
        if (idTokenObj) {
          if (idTokenObj.nonce !== origNonce) {
            console.log(idTokenObj)
            this.debugit('Expected nonce ' + origNonce)
            this.debugit('Actual nonce ' + idTokenObj.nonce)
            throw new Error('Nonce does not match')
          } else {
            this.debugit('Nonce matches ' + origNonce)
          }
        }
      }
      if (origNonce) {
        localStorage.removeItem(this.props.storagePrefix + 'authcode_nonce')
      }

      localStorage.setItem(this.props.storagePrefix + 'id_token', idToken)
    }

    let expiryMins = 60
    if (response.expires_in) {
      expiryMins = response.expires_in / 60
    }
    // We remove 2 minutes from the expiry to give a buffer for refresh
    expiryMins = expiryMins - 2
    if (expiryMins < 1) {
      expiryMins = 1
    }
    this.debugit('Token expiry mins: ' + expiryMins)

    const now = new Date()
    const expiryDate = new Date(now.getTime() + expiryMins * 60000)
    localStorage.setItem(
      this.props.storagePrefix + 'access_token_expiry',
      expiryDate.toString()
    )

    cookies.set(
      this.props.storagePrefix + 'access_token',
      response.access_token,
      { path: '/' }
    )
    this.debugit('New Access Token: ' + response.access_token)

    // update refresh token cookie
    let refreshToken = response.refresh_token
    if (!refreshToken) {
      refreshToken = AuthCodeFunctions.refreshToken(this.props.storagePrefix)
    }
    if (refreshToken) {
      cookies.set(this.props.storagePrefix + 'refresh_token', refreshToken, {
        path: '/',
        expires: new Date(now.setMonth(now.getMonth() + 4))
      })
      this.debugit('New Refresh Token: ' + response.access_token)
    }

    this.setTokenRefresh(1 * 60 * 1000)

    if (!isrefresh) {
      // Remove Verifier
      const verifier = localStorage.getItem(
        this.props.storagePrefix + 'authcode_v'
      )
      if (verifier) {
        localStorage.removeItem(this.props.storagePrefix + 'authcode_v')
      }

      // Redirect if set
      let redirectpath = localStorage.getItem(
        this.props.storagePrefix + 'authcode_authentication_redirect'
      )
      if (!redirectpath) {
        redirectpath = ''
      } else {
        localStorage.removeItem(
          this.props.storagePrefix + 'authcode_authentication_redirect'
        )
      }
      if (this.props.history) {
        this.props.history.replace({
          pathname: redirectpath.includes('?')
            ? redirectpath.substring(0, redirectpath.indexOf('?'))
            : redirectpath,
          search: redirectpath.includes('?')
            ? redirectpath.substring(redirectpath.indexOf('?'))
            : ''
        })
      } else {
        window.location.replace(redirectpath)
      }
    }

    if (this.state.loading) {
      this.setState({ loading: false })
    }
  }

  /**
   * Does a set timeout to allow a refresh when the token expires
   * @param expiryMilliSecs Milliseconds until token expiry minus 2 mins
   */
  private setTokenRefresh(expiryMilliSecs: number) {
    // Set up refresh interval
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
    this.refreshTimer = setTimeout(
      this.processAuth.bind(this, true),
      expiryMilliSecs
    )
  }

  /**
   * Retry the authorization if it has failed
   */
  private retryAuth(): void {
    cookies.remove(this.props.storagePrefix + 'access_token')
    cookies.remove(this.props.storagePrefix + 'refresh_token')
    localStorage.removeItem(this.props.storagePrefix + 'id_token')
    this.getAuthCode(true)
  }

  /**
   * Log additional information
   * @param line what to log
   */
  private debugit(line: string): void {
    if (this.props.enableDebugLog) {
      console.log(line)
    }
  }

  render() {
    if (this.state.signinError) {
      return React.createElement(
        this.props.signInErrorComponent
          ? this.props.signInErrorComponent
          : Message,
        {
          text: this.props.signInErrorText,
          btnText: 'Retry',
          onBtnClick: this.retryAuth
        }
      )
    }

    if (this.state.loading || this.props.doLogout) {
      const loadertext = this.props.doLogout
        ? this.props.signOutText
        : this.props.signInText
      return React.createElement(
        this.props.loaderComponent ? this.props.loaderComponent : Loader,
        { text: loadertext }
      )
    }

    return this.props.children
  }
}

export default AuthCodeProvider
