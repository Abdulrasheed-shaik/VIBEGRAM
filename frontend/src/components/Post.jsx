import React, { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import CommentDailog from './CommentDailog'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import axios from 'axios'
import { setPosts, setSelectedPost } from '@/redux/postSlice.js'
import { Badge } from './ui/badge'
import { Link } from 'react-router-dom'


const Post = ({post}) => {
  const [text,setText] = useState("")
  const [open,setOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true) // initially mute
  const videoRef = useRef(null)
  const observerRef = useRef(null);
  const {user} = useSelector(store=>store.auth)
  const {posts} = useSelector(store => store.post)
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false)
  const [postLike, setPostLike] = useState(post.likes.length)
  const [comment, setComment] = useState(post.comments)
  const dispatch = useDispatch()
  

  const changeEventHandler = (e) => {
    const inputText = e.target.value
    if(inputText.trim()){
      setText(inputText)
    }
    else{
      setText('')
    }
  }

 // Handle mute/unmute
 const handleMuteClick = () => {
  if (videoRef.current) {
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }
};

 // Observer to detect when the video enters or leaves the viewport
 useEffect(() => {
  if (videoRef.current) {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.querySelectorAll('video').forEach((vid) => {
              if (vid !== videoRef.current) {
                vid.pause();
              }
            });
            videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
        });
      },
      {
        threshold: 0.75, // Trigger when 50% of the video is visible
      }
    );
    observerRef.current.observe(videoRef.current);

    // Clean up observer on unmount
    return () => {
      observerRef.current.disconnect();
    };
  }
}, []);

 // Render image or video based on the type of media
 const renderMedia = (media) => {
  if (media.type === 'image') {
    return <img className='rounded-sm my-2 w-full object-cover' src={media.url} alt="post_img" />;
  }
  if (media.type === 'video') {
    return (
      <div className='relative'>
        <video
          ref={videoRef}
          className='rounded-sm my-2 aspect-video object-cover cursor-pointer' // Increased width
          src={media.url}
          muted={isMuted}
          preload="auto"  // Preload the video for faster loading
          onClick={handleMuteClick}
        />
        {/* Mute/Unmute Icon */}
        <div className='absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center group'>
            <span
              onClick={handleMuteClick}
              className='cursor-pointer text-white bg-gray-500 p-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            >
              {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
            </span>
        </div>
      </div>
    );
  }
}

const deletePostHandler = async () =>{
  if (!post?._id) {
    console.log("Post ID is missing.");
    return;
  }
  try {
    const res = await axios.delete(`http://localhost:8000/api/v1/post/delete/${post?._id}`,{withCredentials:true})
    if(res?.data?.success){
      const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id)
      dispatch(setPosts(updatedPostData))
      toast.success(res.data.message)
    }
  } catch (error) {
    console.log(error);
    toast.error(error.response.data.message || 'something went wrong')
    
  }
}

const likeOrDislikeHandler = async () => {
  try {
    const action =  liked ? 'dislike' :'like'
    const res = await axios.get(`http://localhost:8000/api/v1/post/${post._id}/${action}`,{withCredentials:true})
    if(res.data.success){
      const updatedLikes = liked ? postLike - 1 : postLike + 1
      setPostLike(updatedLikes)
      setLiked(!liked)
      //update our post
      const updatedPostData = posts.map(p=>
        p._id ===post._id ? {
          ...p,
          likes:liked?p.likes.filter(id => id !== user._id) : [...p.likes,user._id]
        } : p
      )
      dispatch(setPosts(updatedPostData))
      toast.success(res.data.message)
      
    }
  } catch (error) {
    console.log(error);
    
  }
}

const commentHandler = async () => {
  try {
    const res = await axios.post(`http://localhost:8000/api/v1/post/${post._id}/comment`,{text},{
      headers:{
        'Content-Type':'application/json'
      },withCredentials:true
    })
    if(res.data.success){
      const updatedCommentData = [...comment,res.data.comment]
      setComment(updatedCommentData)
      const updatedPostData = posts.map(p=>
        p._id === post._id ? {...p, comments:updatedCommentData}:p
      )
      dispatch(setPosts(updatedPostData))
      toast.success(res.data.message)
      setText("")
    }
  } catch (error) {
    console.log(error);
    
  }
}

const bookmarkHandler = async () =>{
  try {
    const res = await axios.get(`http://localhost:8000/api/v1/post/${post?._id}/bookmark`,{withCredentials:true})
    if(res.data.success){
      toast.success(res.data.message)
    }
  } catch (error) {
    console.log(error);
    
  }
}


  return (
    <div className='my-8 w-full max-w-md -mx-[10%]'>
      <div className='flex items-center justify-between '>
        <div className='flex items-center gap-2'>
        <Link to={`/profile/${user?._id}`}>
          <Avatar className='w-6 h-6'>
            <AvatarImage src={post.author?.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
          <div className='flex gap-3 items-center'>
          <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
          {user?._id === post.author._id && <Badge variant='secondary'>Author</Badge> }
          </div>
        </div>
        <Dialog >
          <DialogTrigger asChild>
          <MoreHorizontal className='cursor-pointer'/>
          </DialogTrigger>
          <DialogContent className='flex flex-col items-center text-sm text- center'>
            {
              post?.author?._id !== user?._id && <Button variant='ghost' className='cursor-pointer w-fit text-[#ED4956] font-bold'>Unfollow</Button>
            }
            <Button variant='ghost' className='cursor-pointer w-fit '>Add to favorites</Button>
            {
              user && user?._id === post?.author._id && <Button onClick={deletePostHandler} variant='ghost' className='cursor-pointer w-fit '>Delete</Button>
            }
            
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Render Media (Image/Video) */}
      {post.media && post.media.length > 0 && renderMedia(post.media[0])}
      <div className='flex items-center justify-between my-2'>
        <div className='flex items-center gap-3'>
          {
            liked ? <FaHeart onClick={likeOrDislikeHandler} size={'24px'} className='cursor-pointer text-red-600'/> : <FaRegHeart onClick={likeOrDislikeHandler} size={'22px'} className='cursor-pointer hover:text-gray-600'/>
          }
          
          <MessageCircle onClick={() => {
            dispatch(setSelectedPost(post))
            setOpen(true)
            }} className='cursor-pointer hover:text-gray-600'/>
          <Send className='cursor-pointer hover:text-gray-600'/>
        </div>
        <Bookmark onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-600'/>
      </div>
      <span className='font-medium block mb-2'>{postLike} likes</span>
      <p>
        <span className='font-meduim mr-2'>{post.author?.username}</span>
        {post.caption}
      </p>
      {
        comment.length > 0 && (
          <span onClick={() => {
            dispatch(setSelectedPost(post))
            setOpen(true)
            }} className='cursor-pointer text-sm text-gray-400'>view all {comment.length} comments</span>
        )
      }
      
      <CommentDailog open={open} setOpen={setOpen}/>
      <div className='flex justify-between items-center'>
        <input
          type='text'
          placeholder='Add a comment...'
          className='outline-none text-sm w-full'
          value={text}
          onChange={changeEventHandler}
        />
        {
          text && <span onClick={commentHandler} className='text-[#38ADF8] cursor-pointer'>Post</span>
        }
      </div>
    </div>
  )
}

export default Post