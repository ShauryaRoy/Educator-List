dotenv.config()
import express from "express"
import connectDB from './db/db.js'
import dotenv from 'dotenv'

const app = express()

connectDB()


const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
