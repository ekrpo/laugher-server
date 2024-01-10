import Joi from "joi"

export const RegisterSchema = Joi.object({
    username: Joi.string().max(50).regex(/^[a-z0-9._]+$/).required(),
    firstName: Joi.string().max(50).required(),
    lastName: Joi.string().max(50).required(),
    email: Joi.string().email().max(150).required(),
    birthday: Joi.string().isoDate().required(),
    password: Joi.string().max(255).required().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#$%^&+=!])(?=.*[A-Z]).*$/).messages({
        "string.pattern.base": "Password field should has minimum 1 capital letter, 1 number and special character"
    }),
    confirmedPassword: Joi.string().valid(Joi.ref("password")).required().messages({
        "any.only": "Passwords do not match, check password confirmation"
    })
})

export const LoginSchema = Joi.object({
    usernameOrEmail: Joi.string().required(),
    password: Joi.string().required() 
})