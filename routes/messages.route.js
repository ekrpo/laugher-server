import express from "express"
import {verifyAccessToken} from "../middlewares/verify.token.js"
import { errorHandler } from "../middlewares/error.middleware.js"
import { addMessage, getChatMessages } from "../controllers/messages.controller.js"

const messageRoute = express.Router()

messageRoute.post("/add", verifyAccessToken, addMessage, errorHandler)
messageRoute.get("/all/:receiverId/:offset", verifyAccessToken, getChatMessages, errorHandler)

export default messageRoute