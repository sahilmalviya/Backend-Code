import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

app.use(cors ({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))


// Configtation file 
app.use(express.json({limit: "16kb"}))     // json ka Data
app.use(express.urlencoded({extended: true, limit: "16kb"}))   // Url Ka data k liye 
app.use(express.static("public"))


app.use(cookieParser())

 

export { app }