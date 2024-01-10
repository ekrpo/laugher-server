import express from "express"
import { addJoke, getFavouriteJokes, getJoke, getPublicJokes, getUsersJokes, modifyJoke, removeJoke } from "../controllers/jokes.controller.js"
import { validateEnter } from "../middlewares/validation.middleware.js"
import { errorHandler } from "../middlewares/error.middleware.js"
import { verifyAccessToken } from "../middlewares/verify.token.js"
import { upload } from "../middlewares/multer.middlewere.js"
import { checkBlockList } from "../middlewares/checkBlockList.middlewere.js"

const jokesRouter = express.Router()


jokesRouter.post("/create", verifyAccessToken, upload.single("file"),  validateEnter, addJoke, errorHandler)
jokesRouter.get("/public/:sortParameter/:offset", verifyAccessToken, getPublicJokes, checkBlockList, errorHandler)
jokesRouter.get("/home/:sortParameter/:offset", verifyAccessToken, getFavouriteJokes, checkBlockList, errorHandler)
jokesRouter.get("/user/:userId/:offset", verifyAccessToken, getUsersJokes, checkBlockList, errorHandler)
jokesRouter.post("/edit/:jokeId", verifyAccessToken, modifyJoke, errorHandler)
jokesRouter.delete("/delete/:jokeId", verifyAccessToken, removeJoke, errorHandler)
jokesRouter.get("/:jokeId", getJoke, errorHandler)


export default jokesRouter