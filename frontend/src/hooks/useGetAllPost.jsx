import { setPosts } from '@/redux/postSlice.js';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from "react-redux";

const useGetAllPost = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        const fetchAllPost = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/post/all`, { withCredentials: true });
                
                // Check for success and dispatch posts
                if (res.data.success) {
                    console.log(res.data)
                    // Dispatching posts to Redux store
                    dispatch(setPosts(res.data.posts));
                }
            } catch (error) {
                console.log(error); // Log error if any
            }
        };
        
        fetchAllPost(); // Call function to fetch posts
    }, []); // Only re-run if dispatch changes
};

export default useGetAllPost;
