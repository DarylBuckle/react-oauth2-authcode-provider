export default class AuthCodeAuthenticationProperties {
  authUrl: string
  callBackPath: string
  tokenUrl: string
  logoutUrl?: string
  logoutCallBackPath?: string
  clientId: string
  clientSecret?: string
  scope: string = ''
  usePkce: boolean = true
  useState: boolean = true
  useNonce: boolean = true
}
