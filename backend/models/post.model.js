import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    caption:{
        type:String,
        default:''
    },
    media: [
        {
            url: { type: String, required: true }, // Store the file URL
            type: { type: String, enum: ["image", "video"], required: true } // Specify file type
        }
    ],
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Comment'
        }
    ]
})

// Ensure either `image` or `video` is present
postSchema.pre("validate", function (next) {
    if (!this.media || this.media.length === 0) {
        return next(new Error("Either an image or a video is required."));
    }
    next();
});
export const Post = mongoose.model('Post',postSchema)