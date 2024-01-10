export class ValidationError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.type = "Validation Error"
        this.errMessage = message,
        this.statusCode = statusCode
    }
}

export class SendingMailError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.type = "Sending Mail Error"
        this.errMessage = message,
        this.statusCode = statusCode
    }
}

export class InvalidCodeError extends Error{
    constructor(message) {
        super(message)
        this.type = "Invalid Verification Code"
        this.statusCode = 400
    }
}

export class DuplicateUniqueRecordErrror extends Error{
    constructor(message) {
        super(message)
        this.type = "Duplicate Unique Record"
        this.errMessage = message
        this.statusCode = 400
    }
}

export class AccAlreadyVerifiedErrror extends Error{
    constructor(message) {
        super(message)
        this.type = "Account already verified"
        this.errMessage = message
        this.statusCode = 400
    }
}

export class InvalidCredidentials extends Error{
    constructor(message) {
        super(message)
        this.type = "Invalid Credidential"
        this.statusCode = 403
    }
}

export class AuthenticationError extends Error{
    constructor(message) {
        super(message)
        this.type = "Authentication Error"
        this.statusCode = 403
    }
}
