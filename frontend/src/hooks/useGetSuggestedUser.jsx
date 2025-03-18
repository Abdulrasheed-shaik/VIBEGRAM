import { setSuggestedUsers } from '@/redux/authSlice.js';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from "react-redux";

const useGetSuggestedUser = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/user/suggested`, { withCredentials: true });
                
                // Check for success and dispatch posts
                if (res.data.success) {
                    dispatch(setSuggestedUsers(res.data.users));
                }
            } catch (error) {
                console.log(error); // Log error if any
            }
        };
        
        fetchSuggestedUsers(); // Call function to fetch posts
    }, []); // Only re-run if dispatch changes
};

export default useGetSuggestedUser;
