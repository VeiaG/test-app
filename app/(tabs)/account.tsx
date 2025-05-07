import AccountScreen from '@/components/AccountScreen'
import AuthScreen from '@/components/AuthScreen'
import { useAuth } from '@/hooks/useAuth'
import React from 'react'

const Account = () => {
  const {user} = useAuth()
  if(!user) {
    return (
      <AuthScreen/>
    )
  }
  return (
   <AccountScreen/>
  )
}

export default Account