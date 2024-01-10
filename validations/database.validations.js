import pool from "../config/database.config.js";
import { errorHandler } from "../middlewares/error.middleware.js";
import { DuplicateUniqueRecordErrror, InvalidCredidentials } from "../utils/errors.js";
import bcrypt from "bcrypt"


export async function checkDoesUserExisting(req, res, next) { 
    try {
        const dbClient = await pool.connect() //Get connection from pool
    
        const {username, email} = req.body // Collect username and email from user
        
        // Make query to investigate result where username or email are same like entered 
        const checkForDuplicateUser = `
        SELECT username, email
        FROM users
        WHERE username = $1 OR email = $2;
        `
        const queryValues = [username, email]
    
        const result = await dbClient.query(checkForDuplicateUser, queryValues)
        console.log({result:result, body:req.body, values:queryValues})
        if (result.rows.length === 0) { // If there is no result, duplicates not exist
            next()
        }else if (result.rows[0].username === username) { // If usernames match, there is duplicate entry in DB
            throw new DuplicateUniqueRecordErrror("Username already exist")
        }else { // Here is email duplicate
            throw new DuplicateUniqueRecordErrror("Email already exist")
        }
        dbClient.release() // Return connection to the pool
    } catch (error) {
        req.error = error
        errorHandler(req, res)
    }
}

export async function checkUsersCredidentials(req, res, next) {
    try {
        const dbClient = await pool.connect()
        const {usernameOrEmail, password} = req.body

        const checkUsernameOrEmail = `
        SELECT id, password_hash, username, profile_picture_url, first_name, last_name FROM users
        WHERE username = $1 OR email = $2
        `
        const checkValues = [usernameOrEmail, usernameOrEmail]
        const checkResults = await dbClient.query(checkUsernameOrEmail, checkValues)
        if (checkResults.rows.length === 0) {
            throw new InvalidCredidentials("Invalid username or email")
        }

        const hashedPassword = checkResults.rows[0].password_hash
        const isPasswordCorrect = await bcrypt.compare(password, hashedPassword)

        if (!isPasswordCorrect) {
            throw new InvalidCredidentials("Invalid password, please try again")
        }
        req.userId = checkResults.rows[0].id
        req.username = checkResults.rows[0].username
        req.profilePhoto = checkResults.rows[0].profile_picture_url
        req.firstName = checkResults.rows[0].first_name
        req.lastName = checkResults.rows[0].last_name
        req.id = checkResults.rows[0].id
        next()
    } catch (error) {
        req.error = error
        errorHandler(req, res)
    }
}