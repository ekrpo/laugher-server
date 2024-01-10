import express from "express"
import { verifyAccessToken } from "../middlewares/verify.token.js"
import { addComment, deleteComment, editComment, getCommentReplies, getComments, likeComment, unlikeComment } from "../controllers/comment.controller.js"
import { errorHandler } from "../middlewares/error.middleware.js"

const commentRouter = express.Router()

commentRouter.post("/add", verifyAccessToken, addComment, errorHandler)
commentRouter.delete("/:commentId", verifyAccessToken, deleteComment, errorHandler)
commentRouter.get("/all/:jokeId/:offset", verifyAccessToken, getComments, errorHandler)
commentRouter.put("/edit/:commentId", verifyAccessToken, editComment, errorHandler)
commentRouter.get("/replies/:commentId/offset/:offset", verifyAccessToken, getCommentReplies, errorHandler)
commentRouter.put("/like/:authorId/:commentId", verifyAccessToken, likeComment, errorHandler)
commentRouter.put("/unlike/:commentId", verifyAccessToken, unlikeComment, errorHandler)

export default commentRouter