import express from "express"
import { verifyAccessToken } from "../middlewares/verify.token.js"
import { getUsersInfo, searchForUser, suggestUsers } from "../controllers/user.controller.js"
import { errorHandler } from "../middlewares/error.middleware.js"

const userRouter = express.Router()


userRouter.get("/search/:searchedInput", verifyAccessToken, searchForUser, errorHandler)
userRouter.get("/suggest", verifyAccessToken, suggestUsers, errorHandler)
userRouter.get("/info/:userId", verifyAccessToken, getUsersInfo, errorHandler)


export default userRouter