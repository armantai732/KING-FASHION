import express from 'express'
import dotenv from 'dotenv'
import { dbConnect } from './config/db.js'
import routes from './router/router.js'
import cors from 'cors'
dotenv.config()
import path from 'path'

const app = express()
app.set("trust proxy", 1) // so req.ip reflects the real client IP behind a proxy (Vercel/Render/etc.)
app.use(
    cors({
        origin: [
            "https://king-fashion-hazel.vercel.app",
            "http://localhost:5173",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json())

await dbConnect()
// app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api", routes)
// app.use("/api", router);


app.listen(process.env.PORT, () => {
    console.log(`Server Running on port ${process.env.PORT}`)
})
