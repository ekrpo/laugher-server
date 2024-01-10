import jwt from "jsonwebtoken"
import {v4} from "uuid"

export function generateAccessToken(id) {
    const payload = { 
        userId: id,
        uuid: v4()
     }
    const secretKey = process.env.ACCESS_TOKEN_SECRET
    return jwt.sign(payload, secretKey, {
        algorithm: "HS256",
        expiresIn: "120s"
    })
}

export function generateRefreshToken(id){
    const payload = { userId: id, uuid: v4() }
    const secretKey = process.env.REFRESH_TOKEN_SECRET
    return jwt.sign(payload, secretKey, {
        algorithm: "HS256",
        expiresIn: "7d"
    })
}