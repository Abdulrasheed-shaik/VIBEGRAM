import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from 'dotenv'
import connectDB from "./utils/db.js"
import userRoute from './routes/user.route.js'
import postRoute from './routes/post.route.js'
import messageRoute from './routes/message.route.js'
import { app,server } from "./socket/socket.js"

dotenv.config({})



const PORT = process.env.PORT ||3000;

app.get('/',(req,res)=>{
    return res.status(200).json({
        message:"i am coming from backend",
        success:true
    })
})
//middlewares
app.use(express.json({ limit: "500mb" })); // Allows large JSON payloads
app.use(urlencoded({ extended: true, limit: "500mb" })); // Allows large form-data uploads
app.use(cookieParser())
const corsOptions = {
    origin:'http://localhost:5173',
    credentials:true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}
app.use(cors(corsOptions))

//apis
app.use("/api/v1/user",userRoute)
app.use("/api/v1/post",postRoute)
app.use("/api/v1/message",messageRoute)


server.listen(PORT,()=>{
    connectDB()
    console.log(`server running on port ${PORT}`)
})