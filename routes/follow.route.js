import express from "express"
import { blockUser, followUser, getUsersFollowings, unfollowUser } from "../controllers/follow.controller.js"
import { errorHandler } from "../middlewares/error.middleware.js"
import { verifyAccessToken } from "../middlewares/verify.token.js"

const followRouter = express.Router()

followRouter.put("/undo/:receiverId", verifyAccessToken, unfollowUser, errorHandler)
followRouter.put("/block/:receiverId", verifyAccessToken, blockUser, errorHandler )
followRouter.put("/:receiverId", verifyAccessToken,followUser, errorHandler)
followRouter.get("/get/following", verifyAccessToken, getUsersFollowings, errorHandler)


export default followRouter