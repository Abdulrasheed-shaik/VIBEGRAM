import { setMessages } from "@/redux/chatSlice.js";
import { setMessageNotification, clearMessageNotifications } from "@/redux/rtnSlice.js";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom"; // ✅ Fix: Detect route changes

const useGetRTM = () => {
    const dispatch = useDispatch();
    const { socket } = useSelector(store => store.socketio);
    const { messages } = useSelector(store => store.chat);
    const { messageNotification } = useSelector(store => store.realTimeNotification);
    const location = useLocation(); // ✅ Fix: Get current route

    useEffect(() => {
        if (!socket) return;

        socket.on('newMessage', (newMessage) => {
            dispatch(setMessages([...messages, newMessage]));
            dispatch(setMessageNotification({
                type: 'message',
                senderId: newMessage.senderId,
                text: newMessage.message,
                userDetails: newMessage.userDetails
            }));
        });

        socket.on('messageNotification', (notification) => {
            dispatch(setMessageNotification(notification));
        });

        return () => {
            if (socket) {
                socket.off('newMessage');
                socket.off('messageNotification');
            }
        };
    }, [messages, dispatch, socket]);

    // ✅ Fix: Clear notifications when navigating to '/chat'
    useEffect(() => {
        if (location.pathname === "/chat") {
            dispatch(clearMessageNotifications());
        }
    }, [location, dispatch]);
};

export default useGetRTM;
