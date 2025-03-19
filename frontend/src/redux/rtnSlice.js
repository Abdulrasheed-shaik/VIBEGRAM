import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
    name: 'realTimeNotification',
    initialState: {
        likeNotification: [],
        messageNotification: []
    },
    reducers: {
        setLikeNotification: (state, action) => {
            if (action.payload.type === 'like') {
                state.likeNotification.push(action.payload);
            } else if (action.payload.type === 'dislike') {
                state.likeNotification = state.likeNotification.filter(
                    (item) => item.userId !== action.payload.userId
                );
            }
        },
        setMessageNotification: (state, action) => {
            if (action.payload.type === 'message') {
                state.messageNotification.push(action.payload);
            }
        },
        clearLikeNotifications: (state) => {
            state.likeNotification = [];  // Clear all like notifications
        },
        clearMessageNotifications: (state) => {
            state.messageNotification = [];  // Clear all message notifications
        }
    }
});

export const { setLikeNotification, setMessageNotification, clearMessageNotifications, clearLikeNotifications } = rtnSlice.actions;
export default rtnSlice.reducer;
