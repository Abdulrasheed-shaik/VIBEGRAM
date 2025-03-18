import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const SuggestedUsers = () => {
    const {suggestedUsers =[]} = useSelector(store=>store.auth)
    const {userProfile, user} = useSelector(store=>store.auth)
    const dispatch = useDispatch()

    // Filter out users who are already being followed
    const filteredSuggestedUsers = suggestedUsers.filter(suggestedUser => 
        !userProfile?.following?.includes(suggestedUser._id)
    );    
  return (
    <div className='my-10'>
        <div className='flex items-center justify-between text-sm'>
            <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
            <span className='font-medium cursor-pointer'>See All </span>
        </div>
        {
            filteredSuggestedUsers.map((user)=>{
                return (
                    <div key={user._id} className='flex items-center justify-between my-5'>
                        <div className='flex items-center gap-3'>
                            <Link to={`/profile/${user?._id}`}>
                                <Avatar className='w-8 h-8'>
                                    <AvatarImage src={user?.profilePicture} />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div>
                                <h1 className='font-semibold text-sm'><Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
                                <span className='text-gray-600 text-sm'>{user?.bio || 'Bio here......'}</span>
                            </div>
                        </div>
                        <span className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]'>Follow</span>
                    </div>
                )
            })
        }
    </div>
  )
}

export default SuggestedUsers