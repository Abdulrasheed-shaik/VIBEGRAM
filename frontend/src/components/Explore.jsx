import React, { useRef, useState } from 'react';
import { Heart, MessageCircle, Volume2, VolumeX, ImageIcon } from 'lucide-react';
import { useSelector } from 'react-redux';

const Explore = () => {
    const { userProfile } = useSelector((store) => store.auth);
    const [muted, setMuted] = useState(true);
    const [playingVideo, setPlayingVideo] = useState(null);
    const videoRefs = useRef({});
  
    const handleVideoClick = (postId) => {
      const videoElement = videoRefs.current[postId];
      if (playingVideo === postId) {
        videoElement?.pause();
        setPlayingVideo(null);
      } else {
        videoElement?.play();
        setPlayingVideo(postId);
      }
    };
  
    const toggleMute = (postId) => {
      const videoElement = videoRefs.current[postId];
      if (videoElement) {
        videoElement.muted = !muted;
        setMuted(!muted);
      }
    };
  
    return (
      <div className='flex max-w-5xl justify-center mx-auto pl-20'>
        <div className='grid grid-cols-3 gap-1'>
        {userProfile?.posts?.map((post) => {
          const mediaType = post?.media[0]?.type;
          const isVideo = mediaType === 'video';
  
          return (
            <div key={post?._id} className='relative group cursor-pointer'>
              {isVideo ? (
                <div className='relative'>
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current[post._id] = el;
                    }}
                    src={post?.media[0]?.url}
                    className='rounded-sm my-2 w-full aspect-square object-cover'
                    muted={muted}
                  />
                  <div className='absolute inset-0 flex flex-col gap-2 items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <button onClick={() => handleVideoClick(post._id)} className='text-white text-2xl'>
                      {playingVideo === post._id ? '⏸' : '▶️'}
                    </button>
                    <div className='flex items-center text-white space-x-4'>
                      <button className='flex items-center gap-2 hover:text-gray-300'>
                        <Heart />
                        <span>{post?.likes.length}</span>
                      </button>
                      <button className='flex items-center gap-2 hover:text-gray-300'>
                        <MessageCircle />
                        <span>{post?.comments.length}</span>
                      </button>
                    </div>
                  </div>
                  <button onClick={() => toggleMute(post._id)} className='absolute bottom-2 right-2 text-white bg-black/50 rounded-full p-1 w-8 h-8 flex items-center justify-center'>
                    {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
              ) : (
                <div className='relative'>
                  <img
                    src={post?.media[0]?.url}
                    alt='post'
                    className='rounded-sm my-2 w-full aspect-square object-cover'
                  />
                  <ImageIcon className='absolute top-2 right-2 text-white bg-black/50 rounded-full p-1 w-6 h-6' />
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>
    );
}

export default Explore