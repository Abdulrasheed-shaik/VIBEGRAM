import React, { useEffect } from 'react'
import Signup from './components/Signup'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Home from './components/Home'
import Profile from './components/Profile'
import EditProfile from './components/EditProfile'
import ChatPage from './components/ChatPage'
import { io } from 'socket.io-client'
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './redux/socketSlice.js'
import { setOnlineUsers } from './redux/chatSlice.js'
import { setLikeNotification } from './redux/rtnSlice.js'
import ProtectedRoute from './components/ProtectedRoute'
import Explore from './components/Explore'

const browswrRouter = createBrowserRouter([
  {
    path:'/',
    element:<ProtectedRoute><MainLayout /></ProtectedRoute>,
    children:[
    {
      path:'/',
      element: <ProtectedRoute><Home/></ProtectedRoute>
    },
    {
      path:'/profile/:id',
      element:<ProtectedRoute><Profile /></ProtectedRoute>
    },
    {
      path:'/account/edit',
      element:<ProtectedRoute><EditProfile/></ProtectedRoute>
    },
    {
      path:'/chat',
      element:<ProtectedRoute><ChatPage/></ProtectedRoute>
    },
    {
      path:'/explore',
      element:<ProtectedRoute><Explore/></ProtectedRoute>
    }
  ]
  },
  {
    path:'/login',
    element:<Login />,
  },
  {
    path:'/signup',
    element:<Signup />,
  }
])

const App = () => {
  const {user} = useSelector(store =>store.auth)
  const {socket} = useSelector(store =>store.socketio)
  const dispatch= useDispatch()
  useEffect(()=>{
    if(user){
      const socketio =io('http://localhost:8000',{
        query:{
          userId :user?._id
        },
        transports:['websocket']
      })
      dispatch(setSocket(socketio))
      //listen all events
      socketio.on('getOnlineUsers',(onlineUsers)=>{
        dispatch(setOnlineUsers(onlineUsers))
      })
      socketio.on('notification',(notification)=>{
        dispatch(setLikeNotification(notification))
      })
      return ()=>{
        socketio?.close()
        dispatch(setSocket(null))
      }
    }
    else if(socket){
      socket.close()
      dispatch(setSocket(null))
    }
  },[user, dispatch])
  return (
    <>
    <RouterProvider router={browswrRouter}/>
    </>
  )
}

export default App