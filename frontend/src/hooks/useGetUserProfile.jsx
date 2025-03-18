import { setUserProfile } from '@/redux/authSlice.js';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch } from "react-redux";

const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchUserprofile = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/user/${userId}/profile`, { withCredentials: true });
                // Check for success and dispatch posts
                if (res.data.success) {
                    dispatch(setUserProfile(res.data.user));
                }
            } catch (error) {
                console.log(error); // Log error if any
            }
        };
        
        fetchUserprofile(); // Call function to fetch posts
    }, [userId]); // Only re-run if dispatch changes
};

export default useGetUserProfile;
