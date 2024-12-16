import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("../public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routers.js'
import tweetRouter from "./routes/tweet.routers.js"
import subscriptionRouter from "./routes/subscription.routers.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routers.js"
import likeRouter from "./routes/like.router.js"
import playlistRouter from "./routes/playlist.routers.js"

//routes declaration
app.use("/api/v1/users", userRouter) // done
app.use("/api/v1/tweets", tweetRouter) //done
app.use("/api/v1/likes", likeRouter) // done
app.use("/api/v1/videos", videoRouter) // done
app.use("/api/v1/comments", commentRouter) // done
app.use("/api/v1/playlist", playlistRouter) // done
app.use("/api/v1/subscriptions", subscriptionRouter)


// http://localhost:5000/api/v1/users/register




export { app };