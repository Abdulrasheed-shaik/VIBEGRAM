import mongoose, { connect } from "mongoose"

const connectDB = async () =>{
    try{
       await mongoose.connect(process.env.MONGO_URL).then(()=>{console.log("mongodb sucessfully connected")})
    } catch (error ){
        console.log(error)
    }
} 
export default connectDB