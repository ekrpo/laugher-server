import express from "express"
import { emailVerification, refreshToken, signIn, signOut, signUp } from "../controllers/auth.controller.js"
import { errorHandler } from "../middlewares/error.middleware.js"
import { checkDoesUserExisting, checkUsersCredidentials } from "../validations/database.validations.js"
import { sendVerificationMail } from "../services/mail.service.js"
import { validateEnter } from "../middlewares/validation.middleware.js"
import { verifyRefreshToken } from "../middlewares/verify.token.js"

const authRoute = express.Router()

authRoute.post("/signup", checkDoesUserExisting, signUp, sendVerificationMail, errorHandler)
authRoute.post("/email-verification", emailVerification, errorHandler)
authRoute.post("/signin", validateEnter, checkUsersCredidentials, signIn, errorHandler)
authRoute.delete("/signout", verifyRefreshToken, signOut, errorHandler)
authRoute.get("/refresh-token", verifyRefreshToken, refreshToken, errorHandler)

export default authRoute