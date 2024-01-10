import { ValidationError } from "../utils/errors.js"
import { LoginSchema, RegisterSchema } from "../validations/auth.validations.js"
import { JokeSchema } from "../validations/joke.validations.js"
import { errorHandler } from "./error.middleware.js"

export function validateEnter(req, res , next) {
    try {
        const data = req.body
        const url = req.url

        let result;

        if( url.includes("signin") ) {
            result = LoginSchema.validate(data)
        }else if( url.includes("signup") ) {
            result = RegisterSchema.validate(data)
        }else if( url.includes("create") ) {
            
            data.file = req.file
            result = JokeSchema.validate(data)
        }
    
        if (result.error) {
            throw new ValidationError(result.error.message, 400)
        }
        next()
    } catch (error) {
        req.error = error
        errorHandler(req, res)
    }
}