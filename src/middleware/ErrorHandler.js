
// Catches errors within middleware and sends to the custom error handler
const handleErrors = (error, request, response, next) => {
    if (error) {
        next(error)
    } else {
        next();
    }
}


module.exports = { handleErrors } 