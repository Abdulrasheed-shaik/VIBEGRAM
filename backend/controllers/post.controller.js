import sharp from 'sharp'
import streamifier from "streamifier";
import cloudinary from '../utils/cloudinary.js'
import { Post } from '../models/post.model.js'
import { User } from '../models/user.model.js'
import { Comment } from '../models/comment.model.js'
import { getReceiverSocketId, io } from '../socket/socket.js';

const uploadVideoToCloudinary = async (buffer) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            { 
                folder: "posts",
                resource_type: "video",
                eager: [
                    { quality: "auto:low", fetch_format: "mp4", duration: 60 } // ✅ Trim to 1 min & compress
                ],
                chunk_size: 100 * 1024 * 1024, // ✅ Increased chunk size (50MB)
                timeout: 900000, // ✅ Increased timeout (10 min)
                eager_async: true 
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const file = req.file;
        const authorId = req.id;

        if (!authorId) {
            return res.status(400).json({ success: false, message: "Invalid user. Please log in again." });
        }

        if (!file) {
            return res.status(400).json({ success: false, message: "At least one image or video is required." });
        }

        if (file.size > 500 * 1024 * 1024) { // ✅ Reject files larger than 500MB
            return res.status(400).json({ success: false, message: "Video is too large! Max size is 500MB." });
        }

        let fileUrl = null;
        let fileType = "";
        let trimmedMessage = null;
        const mimeType = file.mimetype;

        // **Handle Images**
        if (mimeType.startsWith("image")) {
            console.log("Processing Image...");

            const optimizedImageBuffer = await sharp(file.buffer)
                .resize({ width: 800, height: 800, fit: "inside" })
                .toFormat("jpeg", { quality: 80 })
                .toBuffer();

            const cloudResponse = await new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    { folder: "posts", resource_type: "image" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                streamifier.createReadStream(optimizedImageBuffer).pipe(stream);
            });

            fileUrl = cloudResponse.secure_url;
            fileType = "image";
        } 
        
        // **Handle Videos**
        else if (mimeType.startsWith("video")) {
            console.log("Processing Video...");

            try {
                const videoResponse = await uploadVideoToCloudinary(file.buffer);
                fileUrl = videoResponse.secure_url || null;
                fileType = "video";
                trimmedMessage = "The uploaded video was trimmed to 1 minute and optimized.";
            } catch (error) {
                console.error("Error uploading video:", error);

                if (error.http_code === 413) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "Upload failed! The file is too large."
                    });
                }

                return res.status(500).json({ success: false, message: "Failed to upload video. Please try again." });
            }
        } 
        
        else {
            return res.status(400).json({ success: false, message: "Invalid file type. Only images and videos are allowed." });
        }

        if (!fileUrl) {
            return res.status(202).json({
                success: true,
                message: "Video is being processed. It will be available soon.",
            });
        }

        // **Create the post in MongoDB**
        const post = await Post.create({
            caption,
            media: [{ url: fileUrl, type: fileType }],
            author: authorId,
        });

        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: "author", select: "-password" });

        return res.status(201).json({
            success: true,
            message: "New post added successfully.",
            trimmedMessage, // ✅ Send trim message if applicable
            post,
        });
    } catch (error) {
        console.error("Error adding post:", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again.",
            error: error.message,
        });
    }
};
export const getAllPost = async (req,res)=>{
    try {
        const posts = await Post.find().sort({createdAt:-1}).populate({path:'author',select:'username profilePicture'})
        .populate({
            path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select:'username profilePicture'
            }
        })
        
        return res.status(200).json({
            posts,
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }
} 
export const getUserPost =  async (req,res)=>{
    try {
        const authorId = req.id
        const posts = await Post.find({author:authorId}).sort({createdAt:-1}).populate({
            path:'author',
            select:'username, profilePicture'
        }).populate({
            path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select:'username,profilePicture'
            }
        })
        return res.status(200).json({
            posts,
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }
}
export const likePost = async(req,res)=>{
    try {
        const likeKarneWalaUserId = req.id
        const postId = req.params.id
        const post = await Post.findById(postId)
        if(!post){
            return res.status(404).json({message:'Post not found',success:false})
        }
        // like logic
        await post.updateOne({$addToSet:{likes:likeKarneWalaUserId}})
        await post.save()

        //implement socket io for realtime notification
        const user = await User.findById(likeKarneWalaUserId).select('username profilePicture')
        const postOwnerId = post.author.toString()
        if(postOwnerId !== likeKarneWalaUserId){
            //emit notification
            const notification = {
                type:'like',
                userId:likeKarneWalaUserId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId)
            io.to(postOwnerSocketId).emit('notification',notification)
        }

        return res.status(200).json({message:'Post liked',success:true})

    } catch (error) {
        console.log(error);
        
    }
}
export const disLikePost = async(req,res)=>{
    try {
        const likeKarneWalaUserId = req.id
        const postId = req.params.id
        const post = await Post.findById(postId)
        if(!post){
            return res.status(404).json({message:'Post not found',success:false})
        }
        // like logic
        await post.updateOne({$pull:{likes:likeKarneWalaUserId}})
        await post.save()

        //implement socket io for realtime notification
        const user = await User.findById(likeKarneWalaUserId).select('username profilePicture')
        const postOwnerId = post.author.toString()
        if(postOwnerId !== likeKarneWalaUserId){
            //emit notification
            const notification = {
                type:'dislike',
                userId:likeKarneWalaUserId,
                userDetails:user,
                postId,
                message:'Your post was disliked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId)
            io.to(postOwnerSocketId).emit('notification',notification)
        }
        return res.status(200).json({message:'Post disliked',success:true})

    } catch (error) {
        console.log(error);
        
    }
}
export const addComment = async (req,res)=>{
    try {
        const postId = req.params.id
        const commentKarneWalaUserId = req.id

        const {text} = req.body
        const post = await Post.findById(postId)
        if(!text){
            return res.status(400).json({message:'Text is requires',success:false})
        }
        const comment = await Comment.create({
            text,
            author:commentKarneWalaUserId,
            post:postId
        })
        await comment.populate({
            path:'author',
            select:'username profilePicture'
        })

        post.comments.push(comment._id)
        await post.save()

        return res.status(201).json({
            message:'Comment Added',
            comment,
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }
}
export const getCommentsOfPost = async (req,res)=>{
    try {
        const postId = req.params.id;

        const comments = await Comment.find({post:postId}).populate('author','username profilePicture');

        if(!comments){
            return res.status(404).json({
                message:'No comments found for this post',
                success:false
            })
        }
        return res.status(200).json({
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }
}
export const deletePost = async (req,res)=>{
    try {
        const postId = req.params.id
        const authorId = req.id

        const post = await Post.findById(postId)
        if(!post){
            return res.status(404).json({
                message:'Post not found',
                success:false
            })
        }
        // check if the logged in user is the owner of the post
        if(post.author.toString() !== authorId){
            return res.status(403).json({message:'Unauthorized'})
        }

        //delete post
        await Post.findByIdAndDelete(postId);
        // remove the pst from user's post
        let user = await User.findById(authorId)
        user.posts = user.posts.filter(id => id.toString() !== postId)
        await user.save()
        
        //delete assocaited comments
        await Comment.deleteMany({post:postId})

        return res.status(200).json({
            message:'Post deleted',
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }
}
export const bookmarkPost = async (req,res)=>{
    try {
        const postId = req.params.id;
        const authorId = req.id
        const post = await Post.findById(postId)
        if(!post){
            return res.status(404).json({
                message:'Post not found',
                success:false
            })
        }

        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            // already bookmark ->remove bookmark
            await user.updateOne({$pull:{bookmarks:post._id}})
            await user.save()
            return res.status(200).json({
                type:'unsaved',
                message:"Post removed from bookmark",
                success:true
            })
        }else{
            // bookmark the post
            await user.updateOne({$addToSet:{bookmarks:post._id}})
            await user.save()
            return res.status(200).json({
                type:'saved',
                message:"Post bookmarked",
                success:true
            })
        }
    } catch (error) {
        console.log(error);
        
    }
}