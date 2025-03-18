import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
    const { user } = useSelector(store => store.auth)
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
    }, [user, navigate]) // Add dependencies to ensure effect runs when user changes

    if (!user) {
        return null // Prevent rendering protected content before redirect
    }

    return <>{children}</>
}

export default ProtectedRoute
