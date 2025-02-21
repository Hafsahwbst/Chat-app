"use client"
import { AppProvider } from '@/Context/AppProvider'
import React from 'react'

const Template = ({children}) => {
  return (
    <div>
            <AppProvider>
{children}
</AppProvider>
    </div>
  )
}

export default Template