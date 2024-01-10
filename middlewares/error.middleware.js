export function errorHandler (req, res) {
    const error = req.error
    const errorObj = {
        type: error,
        errMessage: error.message,
        code: error.statusCode
    }
    return res.status(400).json(errorObj)    
}