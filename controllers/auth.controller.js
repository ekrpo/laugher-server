import pool from "../config/database.config.js"
import { errorHandler } from "../middlewares/error.middleware.js"
import { InvalidCodeError, ValidationError } from "../utils/errors.js"
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js"
import { RegisterSchema } from "../validations/auth.validations.js"
import bcrypt from "bcrypt"


//Generate randooom verification code
function generateCode() {
  return Math.round(Math.random() * 1000000);
}
/*
This function starting registering user, validating users enters,
hashing password and inserting unoffical data in database.
Second part of registering user (email verification) is forwarded to another function.
*/
export async function signUp(req, res, next) {
  try {
    const dbClient = await pool.connect(); // Get connection from the pool

    const userData = req.body; // Retrieve users data

    // Validate users data and inspect for potential errors
    const { error } = RegisterSchema.validate(userData);
    if (error) {
      throw new ValidationError(error.message, 400);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10); // Hash password 

    // Modify password and delete confirmedPassword atributes to be ready
    // to use 'userData' object's values in DB query.
    userData.password = hashedPassword
    delete userData.confirmedPassword

    const insertUnofficialUser = `
    INSERT INTO unverified_users (code, username, first_name, last_name, email, birthday, password_hash)
    VALUES ($1, $2, $3, $4, $5, $6, $7);
    `
    const queryValues = Object.values(userData) // Get array of object's values
    const verificationCode = generateCode()  // Call function for generate verification code
    queryValues.unshift(verificationCode) // Add verification code on first place in array of query values
    
    await dbClient.query(insertUnofficialUser, queryValues) // Make query for inserting user in unofficial user's table

    // Make visible email and code value to the next middleware
    req.verificationCode = verificationCode
    req.userEmail = userData.email

    dbClient.release(); // Exit from connection
    next() 

  } catch (error) {
      req.error = error
      errorHandler(req, res);
  }
}

export async function emailVerification(req, res, next) {
  try {
      const dbClient = await pool.connect() // Get DB connection from pool

      const verificationCode = req.body.verificationCode // Collect verification code enter from user

      // Make query to check will DB return to us any result based on entered code
      const checkVerificationCode = `
      SELECT code FROM unverified_users
      WHERE code = $1;
      `
      const queryResult = await dbClient.query(checkVerificationCode, [verificationCode])
      //If there is no result, code is not valid (ERROR)
      if (queryResult.rows.length === 0) {
        throw new InvalidCodeError("You enetered invalid verification code")
      }
      
      // Copy users data from unofficial table to offcial user's table
      const verifyUserQuery = `
        INSERT INTO users ( first_name, last_name, birthday, password_hash, username, email)
        SELECT first_name, last_name, birthday, password_hash, username, email
        FROM unverified_users
        WHERE code = $1;
      ` 
      await dbClient.query(verifyUserQuery, [verificationCode])

      // Delete user's data from 'unverified_users' tables because user is verified
      const deleteUnverifiedUser = `
        DELETE FROM unverified_users
        WHERE code = $1; 
      `

      await dbClient.query(deleteUnverifiedUser, [verificationCode])

      dbClient.release() // Return connection to the pool

      // Make positive reponse to the user
      return res.json({
          redirectUrl: "/login",
          message: "You are done email verification with success"
      })

  } catch (error) {
      req.error = error
      console.error(error)
      next()
  }
}

export async function signIn(req, res, next) {
  try {
    const dbClient = await pool.connect()

    const accessToken = generateAccessToken(req.userId)
    const refreshToken = generateRefreshToken(req.userId)

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "Strict",
      path: "/"
    })

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
    })

    const userId = req.userId
    const insertRefreshToken = `
    INSERT INTO refresh_tokens(token, user_id)
    VALUES ($1, $2);
    `
    const insertionValues = [refreshToken, userId]
    await dbClient.query(insertRefreshToken, insertionValues)

    dbClient.release()

    return res.json({
      redirectUrl: "/",
      message: "Successfully signed in",
      username: req.username,
      profilePhoto: req.profilePhoto,
      firstName: req.firstName,
      lastName: req.lastName,
      id: req.id
    })
  } catch (error) {
    req.error = error
    next()
  }
}

export async function signOut(req, res, next) {
  try {
    const dbClient = await pool.connect()

    const refreshToken = req.cookies.refreshToken
    
    const deleteRefreshToken = `
    DELETE FROM refresh_tokens
    WHERE token = $1;
    `
    const deletionResult = await dbClient.query(deleteRefreshToken, [refreshToken])
    if(deletionResult.affectedRows === 0){
      throw new Error("User is already signed out")
    }

    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")

    return res.json({
      redirectUrl: "/auth/signin",
      message: "Successfully signed out"
    })
  } catch (error) {
    req.error = error
    next()
  }


}

export async function refreshToken(req, res, next) {
  try {
    const dbClient = await pool.connect()

    const refreshToken = req.cookies.refreshToken

    const deleteOldToken = `
    DELETE FROM refresh_tokens
    WHERE token = $1;
    `

    const result = await dbClient.query(deleteOldToken, [refreshToken])
    console.log(result)

    const newAccessToken = generateAccessToken(req.userId)
    const newRefreshToken = generateRefreshToken(req.userId)

    const insertNewToken = `
    INSERT INTO refresh_tokens (token, user_id)
    VALUES ($1, $2);
    `
    const insertionValues = [newRefreshToken, req.userId]
    await dbClient.query(insertNewToken, insertionValues)

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 1000 * 60 * 60
    })

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7
    })

    await dbClient.release() 

    return res.json({
      message: "Token refreshed"
    })
  } catch (error) {
    req.error = error
    next()
  }
}