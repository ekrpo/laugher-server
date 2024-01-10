import express from "express"
import {verifyAccessToken} from "../middlewares/verify.token.js"
import { errorHandler } from "../middlewares/error.middleware.js"
import { clearNotificationCounter, getNotificationCounter, getNotifications } from "../controllers/notifications.controller.js"

const notificationsRoute = express.Router()

notificationsRoute.get("/", verifyAccessToken, getNotifications, errorHandler)
notificationsRoute.get("/notification-counter", verifyAccessToken, getNotificationCounter, errorHandler)
notificationsRoute.put("/clear-counter", verifyAccessToken, clearNotificationCounter, errorHandler)


export default notificationsRoute