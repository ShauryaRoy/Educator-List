import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect("mongodb+srv://shauryaroy2004:1EgbiHevPhq1JHun@cluster0.0w1xu.mongodb.net/test?retryWrites=true&w=majority")
        console.log(`MongoDB is connected , DB_HOST : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Error: " + error)
        process.exit(1)
    }
}
export default connectDB

// f2DYX68mST8kU92g