import express from "express"
import { getReactions, reactOnJoke } from "../controllers/reactions.controller.js"
import { verifyAccessToken } from "../middlewares/verify.token.js"
import { errorHandler } from "../middlewares/error.middleware.js"

const reactionsRouter = express.Router()

reactionsRouter.post("/add", verifyAccessToken, reactOnJoke, errorHandler)
reactionsRouter.get("/joke/:jokeId", verifyAccessToken, getReactions, errorHandler)

export default reactionsRouter