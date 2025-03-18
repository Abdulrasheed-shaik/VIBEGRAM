import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { readFileAsDataURL } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setPosts } from '@/redux/postSlice.js'


const CreatePost = ({open,setOpen}) => {
    const imageRef = useRef()
    const [file,setFile] = useState('')
    const [caption,setCaption] = useState('')
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [fileType, setFileType] = useState(""); // Tracks if it's an image or video
    const {user} = useSelector(store => store.auth)
    const {posts} = useSelector(store => store.post)
    const dispatch = useDispatch()
    const fileChangeHandler = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          setFile(file);
          setFileType(file.type.startsWith("image") ? "image" : "video"); // Set correct file type
          const dataUrl = await readFileAsDataURL(file);
          setImagePreview(dataUrl);
        }
      }
    const createPostHandler = async (e) => {
        const formData = new FormData();
        formData.append("caption", caption);
        if(imagePreview) formData.append("media", file);
        try {
            setLoading(true)
         const res = await axios.post('http://localhost:8000/api/v1/post/addpost', formData,{
            headers:{
                'Content-Type':'multipart/form-data'
            },
            withCredentials:true
         })
         if(res.data.success){
            dispatch(setPosts([res.data.post, ...posts]))
            toast.success(res.data.message)
            setOpen(false)
         }
        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally{
            setLoading(false)
        }
  }
  return (
    <Dialog open={open} className='focus- border-none'>
        <DialogTitle className='hidden'>My Dialog Title</DialogTitle>
        <DialogContent onInteractOutside={()=>setOpen(false)}>
            <DialogHeader className='texts-center font-semibold'>Create New Post</DialogHeader>
            <div className='flex gap-3 items-center'>
                <Avatar>
                    <AvatarImage src={user?.profilePicture} alt="img" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
            <div>
                <h1 className='font-semibold text-xs'>{user?.username}</h1>
                <span className='text-gray-600 text-xs'>Bio here...</span>
            </div>
            <Textarea value={caption} onChange={(e)=> setCaption(e.target.value)} className='focus-visible:ring-transparent border-none' placeholder='Write a caption'/>
            {
                imagePreview && (
                    <div className='w-full h-64 flex items-center justify-center'>
                        {fileType === "image" ? (

                            <img src={imagePreview} alt="preview_img" className='object-cover h-full w-full rounded-md' />
                        ):(
                            <video controls className="object-cover h-full w-full rounded-md">
                                <source src={imagePreview} type={file?.type} />
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>
                )
            }
            <input ref={imageRef} type="file" className='hidden'  accept="image/*, video/*" onChange={fileChangeHandler}/>
            <Button onClick={()=>imageRef.current.click()} className='w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]'> {file ? "Change File" : "Select from Computer"}</Button>
            {
                imagePreview && (
                    loading ? (
                        <Button>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                            Uploading....
                        </Button>
                    ) :(
                        <Button onClick={createPostHandler} type='submit' className='w-full'>
                            Post
                        </Button>
                    )
                )
            }
        </DialogContent>
    </Dialog>
  )
}

export default CreatePost