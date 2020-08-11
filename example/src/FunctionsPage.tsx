import React, { useState } from 'react'
import { AuthCodeFunctions } from 'react-oauth2-authcode-provider'
import axios from 'axios'

const FunctionsPage = (props: any) => {
  const [userInfoLoading, setUserInfoLoading] = useState<boolean>(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const loggedIn = AuthCodeFunctions.isLoggedIn()

  return (
    <div>
      <div className='mt-3 mb-3'>
        <button className='btn btn-primary mr-3' onClick={() => AuthCodeFunctions.doAuthorizationCodeFlow(props.authProps)}>Start Authorization Code Flow</button>
        <button className='btn btn-primary mr-3' onClick={() => AuthCodeFunctions.doLogoutFlow(props.authProps)}>Start Log out Flow</button>
      </div>
      <div className='mt-3 mb-3'>
        <button className='btn btn-primary mr-3' disabled={!loggedIn} onClick={() => {
          setUserInfoLoading(true)
          axios
          .post('https://dev-emf33n24.eu.auth0.com/userinfo', null, {
            headers: AuthCodeFunctions.signRequest({
              'content-type': 'application/json'
            })
          })
          .then((response: any) => {
            setUserInfoLoading(false)
            setUserInfo(response)
          })
          .catch((error: any) => {
            console.log(error)
            setUserInfoLoading(false)
            setUserInfo(error)
          })
        }}>Get User Info</button>
        {userInfoLoading ? 'Loading...' : ''}
        {userInfo && !userInfoLoading ? <div className='mt-2'>{userInfo?.data ? JSON.stringify(userInfo?.data) : 'Error'}</div> : ''}
      </div>
    </div>
  )

}

export default FunctionsPage
