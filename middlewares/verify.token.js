import jwt from "jsonwebtoken"
import { AuthenticationError } from "../utils/errors.js"
import { errorHandler } from "./error.middleware.js"
import pool from "../config/database.config.js"


export function verifyAccessToken(req, res, next) {
    try {
        const accessToken = req.cookies.accessToken

        if ( !accessToken ) {
            throw new AuthenticationError("Access token not exist")
        }

        const secretKey = process.env.ACCESS_TOKEN_SECRET
        const decoded = jwt.verify(accessToken, secretKey, {algorithms:["HS256"]})

        req.userId = decoded.userId
        next()
    } catch (error) {
        req.error = error
        errorHandler(req, res)
    }
}

export async function verifyRefreshToken(req, res, next) {
    try {
        const dbClient = await pool.connect()

        const refreshToken = req.cookies.refreshToken
        console.log(refreshToken)
        if ( !refreshToken ) {
            throw new AuthenticationError("Refresh token not exist")
        } 

        const secretKey = process.env.REFRESH_TOKEN_SECRET

        const decoded = jwt.verify(refreshToken, secretKey, {algorithms:["HS256"]})

        req.userId = decoded.userId

        const checkRefreshToken = `
        SELECT token FROM refresh_tokens
        WHERE token = $1;
        `
        const queryValues = [refreshToken]
        const checkResults = await dbClient.query(checkRefreshToken, queryValues)

        if (checkResults.rows.length === 0) {
            throw new AuthenticationError("Refresh token is not valid")
        }
        await dbClient.release()
        next()
    } catch (error) {
        req.error = error
        errorHandler(req, res)
    }
}