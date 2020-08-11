export default class AuthCodeProps {
  /**
   * Url of the authentication endpoint of the authentication server (login screen)
   */
  authUrl: string = ''

  /**
   * Local path to redirect back to after authenticating
   */
  callBackPath: string = ''

  /**
   * Url of the token endpoint of the authentication server
   */
  tokenUrl: string = ''

  /**
   * Url of the logout endpoint of the authentication server
   */
  logoutUrl?: string

  /**
   * Local path to redirect back to after logging out
   */
  logoutCallBackPath?: string

  /**
   * Your applications Client Id
   */
  clientId: string = ''

  /**
   * Your applications Client Secret if applicable
   */
  clientSecret?: string

  /**
   * Scope to request
   */
  scope: string = ''

  /**
   * Enable proof key for code exchange (security)
   */
  usePkce: boolean = true

  /**
   * Enable state matching (security)
   */
  useState: boolean = true

  /**
   * Enable nonce matching (security)
   */
  useNonce: boolean = true
}
