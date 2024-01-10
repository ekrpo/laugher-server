import express from "express"
import helmet from "helmet"
import dotenv from "dotenv"
import authRoute from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
import jokesRouter from "./routes/jokes.route.js"
import followRouter from "./routes/follow.route.js"
import reactionsRouter from "./routes/reactions.route.js"
import commentRouter from "./routes/comment.route.js"
import cors from "cors"
import userRouter from "./routes/user.route.js"
import { Server } from "socket.io"
import http from "http"
import messageRoute from "./routes/messages.route.js"
import notificationsRoute from "./routes/notifications.route.js"


dotenv.config()

const app = express()

const httpServer = http.createServer(app)

const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000", // Replace with the origin of your React app
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  })



app.use(express.json())
app.use(helmet())
app.use(cookieParser())
app.use(cors({}))
io.on("connection", socket => {
    socket.on("connected", (id)=>{
        socket.customId = id
    })

    socket.on("private-message", (userId, msg)=>{
        let socketId
        io.sockets.sockets.forEach(socket=>{
            if(socket.customId == userId){
                socketId = socket.id
            }
        })
        socket.to(socketId).emit("receive-message", {
            senderId: socket.customId,
            message: msg
        })
    })

    socket.on("notification", (userId)=>{
        let socketIdList = []
        io.sockets.sockets.forEach(socket=>{
            if(socket.customId == userId){
                socketIdList.push(socket.id)
            }
        })
        for(let socketId of socketIdList){
            socket.to(socketId).emit("receive-notification", {})
        }

    })
})

app.use('/uploads',  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
express.static("/home/edin/Desktop/Laugher/server/uploads"))

app.use("/auth", authRoute)
app.use("/joke", jokesRouter)
app.use("/follow", followRouter)
app.use("/reaction", reactionsRouter)
app.use("/comment", commentRouter)
app.use("/user", userRouter)
app.use("/message", messageRoute)
app.use("/notifications", notificationsRoute)


const PORT = process.env.SERVER_PORT
const HOST = '0.0.0.0'
httpServer.listen(PORT, HOST, ()=>{
    console.log(`Server running on port ${PORT}`)
})
