import Cookies from 'universal-cookie'
// eslint-disable-next-line no-unused-vars
import AuthCodeProps from './AuthCodeProps'

const cookies = new Cookies()
const crypto = require('crypto')

/**
 * Returns true if there is a an access_token or refresh_token cookie present
 * (IE. authorization has been completed)
 */
export function isLoggedIn(storagePrefix: string = ''): boolean {
  if (hasRefreshToken(storagePrefix)) {
    return true
  } else if (hasAccessToken(storagePrefix) && !hasTokenExpired(storagePrefix)) {
    return true
  }
  return false
}

/**
 * Determines if the current access_token is still valid (2 minute leeway)
 */
export function hasTokenExpired(storagePrefix: string = ''): boolean {
  let tokenExpired: boolean = false
  const accessTokenExpiry: any = localStorage.getItem(
    storagePrefix + 'access_token_expiry'
  )
  if (accessTokenExpiry) {
    var now = new Date()
    const accessTokenExpiryDate = new Date(accessTokenExpiry)
    if (now >= accessTokenExpiryDate) {
      tokenExpired = true
    }
  }
  return tokenExpired
}

/**
 * Returns true if there is an access token cookie present
 */
export function hasAccessToken(storagePrefix: string = ''): boolean {
  return !!accessToken(storagePrefix)
}

/**
 * Returns the access_token which is saved as a cookie
 */
export function accessToken(storagePrefix: string = ''): string {
  return cookies.get(storagePrefix + 'access_token')
}

/**
 * Returns true if there is a refresh token cookie present
 */
export function hasRefreshToken(storagePrefix: string = ''): boolean {
  return !!refreshToken(storagePrefix)
}

/**
 * Returns the refresh_token which is saved as a cookie
 */
export function refreshToken(storagePrefix: string = ''): string {
  return cookies.get(storagePrefix + 'refresh_token')
}

/**
 * Adds Authorization = 'Bearer access_token' to request headers if an access_token is present
 * @requestHeaders An object containing the headers of the request to be sent
 */
export function signRequest(
  requestHeaders: any,
  storagePrefix: string = ''
): any {
  if (!requestHeaders) {
    requestHeaders = {}
  }
  const token = accessToken(storagePrefix)
  if (token) {
    requestHeaders.Authorization = 'Bearer ' + token
  }
  return requestHeaders
}

/**
 * Begins authorization by redirecting to the authorization endpoint of the authentication server
 * @authenticationProps An object containing authentication properties
 * @returnTo The path to go back to after authorization has been completed. If not set it will use the current path
 */
export function doAuthorizationCodeFlow(
  authenticationProps: AuthCodeProps,
  returnTo: string | null = null,
  storagePrefix: string = '',
  isretry: boolean = false
): void {
  cookies.remove(storagePrefix + 'access_token')
  cookies.remove(storagePrefix + 'refresh_token')
  localStorage.removeItem(storagePrefix + 'id_token')
  if (
    !isretry ||
    !localStorage.getItem(storagePrefix + 'authcode_authentication_redirect')
  ) {
    let postAuthenticationRedirect = returnTo
    if (postAuthenticationRedirect == null) {
      postAuthenticationRedirect =
        window.location.pathname + window.location.search
    }
    localStorage.setItem(
      storagePrefix + 'authcode_authentication_redirect',
      postAuthenticationRedirect
    )
  }
  const codeLocation = getCodeLocation(authenticationProps, storagePrefix)
  window.location.replace(codeLocation)
}

function getCodeLocation(
  authenticationProps: AuthCodeProps,
  storagePrefix: string = ''
): string {
  const {
    authUrl,
    callBackPath,
    clientId,
    scope,
    usePkce,
    useState,
    useNonce
  } = authenticationProps

  let url = authUrl
  url += '?client_id=' + clientId
  url += '&response_type=code'
  if (scope) {
    url += '&scope=' + encodeURIComponent(scope)
  }

  url += '&redirect_uri=' + encodeURIComponent(buildRedirectUri(callBackPath))

  if (usePkce) {
    const verifier = base64URLEncode(crypto.randomBytes(32))
    const challenge = base64URLEncode(sha256(verifier))
    localStorage.setItem(storagePrefix + 'authcode_v', verifier)

    url += '&code_challenge=' + challenge
    url += '&code_challenge_method=S256'
  } else {
    localStorage.removeItem(storagePrefix + 'authcode_v')
  }

  if (useState) {
    const state = base64URLEncode(crypto.randomBytes(32))
    localStorage.setItem(storagePrefix + 'authcode_state', state)

    url += '&state=' + state
  } else {
    localStorage.removeItem(storagePrefix + 'authcode_state')
  }

  if (useNonce) {
    const nonce = base64URLEncode(crypto.randomBytes(32))
    localStorage.setItem(storagePrefix + 'authcode_nonce', nonce)

    url += '&nonce=' + nonce
  } else {
    localStorage.removeItem(storagePrefix + 'authcode_nonce')
  }

  return url
}

/**
 * Begins logout by redirecting to the logout endpoint of the authentication server
 * @authenticationProps An object containing authentication properties
 */
export function doLogoutFlow(
  authenticationProps: AuthCodeProps,
  storagePrefix: string = ''
): void {
  cookies.remove(storagePrefix + 'access_token')
  cookies.remove(storagePrefix + 'refresh_token')
  localStorage.removeItem(storagePrefix + 'id_token')

  const redirectURI = encodeURIComponent(
    buildRedirectUri(
      authenticationProps.logoutCallBackPath == null
        ? ''
        : authenticationProps.logoutCallBackPath
    )
  )
  window.location.replace(
    authenticationProps.logoutUrl +
      '?post_logout_redirect_uri=' +
      redirectURI +
      '&returnTo=' +
      redirectURI +
      '&client_id=' +
      authenticationProps.clientId
  )
}

/**
 * Gets the full redirectUri from a path name
 */
export function buildRedirectUri(path: string): string {
  let pathMod = path
  if (!pathMod) {
    pathMod = ''
  }
  if (
    pathMod.toUpperCase().includes('HTTP://') ||
    pathMod.toUpperCase().includes('HTTPS://')
  ) {
    return pathMod
  } else {
    return location.protocol + '//' + location.host + pathMod
  }
}

/**
 * base64 encodes a url
 * @str url
 * @returns string - base64 encoded url
 */
export function base64URLEncode(str: any): string {
  return str
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * sha256 encodes a string
 * @buffer string
 * @returns string - sha256 encoded version of buffer
 */
export function sha256(buffer: string): string {
  return crypto.createHash('sha256').update(buffer).digest()
}

/**
 * Gets the value of a uri parameter
 * @name string - the name of the parameter
 * @url string - the url to get the parameter value from
 */
export function getURIParameterByName(name: string, url: string) {
  name = name.replace(/[[\]]/g, '\\$&')
  const regex = new RegExp('[?&#]' + name + '(=([^&#]*)|&|#|$)')
  const results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

/**
 * Decode Jwt to json string
 * @token id_token
 */
export function parseJwt(token: string): string {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join('')
  )
  return jsonPayload
}
