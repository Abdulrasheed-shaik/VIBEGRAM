import React, { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { Button } from './ui/button'
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux'
import Comment from './Comment'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts } from '@/redux/postSlice.js'

const CommentDailog = ({open , setOpen}) => {
    const [text,setText] =useState('')
    const {selectedPost, posts} = useSelector(store => store.post)
    const [isMuted, setIsMuted] = useState(true)
    const videoRef = useRef(null)
    const dispatch  = useDispatch()  
    const [comment, setComment] = useState([])

    useEffect(()=>{
        if(selectedPost){
            setComment(selectedPost?.comments)
        }
    },[selectedPost])
    

    const changeEventHandler = (e) => {
        const inputText = e.target.value
        if(inputText.trim()){
            setText(inputText)
        }else{
            setText('')
        }
    }

    // Handle mute/unmute for video
    const handleMuteClick = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }
    // Determine if media is image or video
    const renderMedia = (media) => {
        if (media.type === 'image') {
            return <img className='w-full h-full object-cover rounded-l-lg' src={media.url} alt="post_img" />;
        }
        if (media.type === 'video') {
            return (
                <div className='relative'>
                    <video
                        ref={videoRef}
                        className='w-full h-full object-cover rounded-l-lg'
                        src={media.url}
                        muted
                        preload="auto"
                        autoPlay
                        style={{ aspectRatio: '16 / 9' }}
                        onClick={handleMuteClick}
                    />
                    <div className='absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center group'>
                        <span
                            onClick={handleMuteClick}
                            className='cursor-pointer text-white bg-gray-500 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                        >
                            {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                        </span>
                    </div>
                </div>
            );
        }
    }
    const sendMessageHandler = async () => {
        try {
          const res = await axios.post(`http://localhost:8000/api/v1/post/${selectedPost._id}/comment`,{text},{
            headers:{
              'Content-Type':'application/json'
            },withCredentials:true
          })
          if(res.data.success){
            const updatedCommentData = [...comment,res.data.comment]
            setComment(updatedCommentData)
            const updatedPostData = posts.map(p=>
              p._id === selectedPost._id ? {...p, comments:updatedCommentData}:p
            )
            dispatch(setPosts(updatedPostData))
            toast.success(res.data.message)
            setText("")
          }
        } catch (error) {
          console.log(error);
          
        }
      }

  return (
    <div>
        <Dialog open={open}>
            <DialogContent onInteractOutside={()=>setOpen(false)} className='max-w-2xl p-0 flex flex-col'>
                <div className='flex flex-1'>
                    <div className='w-1/2'>
                    {selectedPost?.media?.length > 0 && renderMedia(selectedPost.media[0])}
                    </div>
                    <div className='w-1/2 flex flex-col justify-between'>
                        <div className='flex items-center justify-between p-4'>
                            <div className='flex gap-3 items-center'>
                                <Link>
                                    <Avatar>
                                        <AvatarImage src={selectedPost?.author.profilePicture}/>
                                        <AvatarFallback>AR</AvatarFallback>
                                    </Avatar> 
                                </Link>
                                <div>
                                    <Link className='font-semibold text-xs'>{selectedPost?.author.username}</Link>
                                    {/* <span className='text-gray-600 text-sm'>bio here....</span> */}
                                </div>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <MoreHorizontal className='cursor-pointer'/>
                                </DialogTrigger>
                                <DialogContent className='flex flex-col items-center text-sm text-center'>
                                    <div className='cursor-pointer w-full text-[#ED4956] font-bold'>
                                        Unfollow
                                    </div>
                                    <div className='cursor-pointer w-full'>
                                        Add to favorites
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <hr />
                        <div className='flex-1 overflow-y-auto max-h-96 p-4'>
                            {
                                comment.map((comment)=> <Comment key={comment._id} comment={comment}/>)
                            }
                        </div>
                        <div className='p-4'>
                            <div className='flex gap-3 items-center'>
                                <input type="text" value={text} onChange={changeEventHandler} placeholder='Add a comment...' className='w-full outline-none border text-sm border-gray-300 p-2 rounded-3xl'/>
                                <Button disabled={!text.trim()} onClick={sendMessageHandler} variant='outline' className="rounded-2xl">Send</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  )
}

export default CommentDailog