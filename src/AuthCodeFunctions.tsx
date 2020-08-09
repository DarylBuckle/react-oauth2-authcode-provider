import Cookies from 'universal-cookie'
import AuthCodeAuthenticationProperties from './AuthCodeAuthenticationProperties'

const cookies = new Cookies()
const crypto = require('crypto')

export function isLoggedIn(storagePrefix: string = ''): boolean {
  if (hasRefreshToken(storagePrefix)) {
    return true
  } else if (hasAccessToken(storagePrefix) && !hasTokenExpired(storagePrefix)) {
    return true
  }
  return false
}

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

export function hasAccessToken(storagePrefix: string = ''): boolean {
  return !!accessToken(storagePrefix)
}

export function accessToken(storagePrefix: string = ''): string {
  return cookies.get(storagePrefix + 'access_token')
}

export function hasRefreshToken(storagePrefix: string = ''): boolean {
  return !!refreshToken(storagePrefix)
}

export function refreshToken(storagePrefix: string = ''): string {
  return cookies.get(storagePrefix + 'refresh_token')
}

export function doAuthorisationCodeFlow(
  authenticationProps: AuthCodeAuthenticationProperties,
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
  const codeLocation = getCodeLocation(authenticationProps)
  window.location.replace(codeLocation)
}

function getCodeLocation(
  authenticationProps: AuthCodeAuthenticationProperties,
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

export function doLogoutFlow(
  authenticationProps: AuthCodeAuthenticationProperties,
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

export function buildRedirectUri(path: string): string {
  let pathMod = path
  if (!pathMod) {
    pathMod = ''
  }
  return location.protocol + '//' + location.host + pathMod
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
 * Used to decode Jwt
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
