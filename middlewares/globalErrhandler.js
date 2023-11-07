const globalErrhandler = (err, req, res, next) => {
    //status
    //message
    //stack
    const stack = err.stack;
    const message = err.message;
    const status = err.status;
    const statusCode = err?.statusCode ? err.statusCode : 500;
    //send response
    res.status(statusCode).json({
        message,
        status,
        stack,
    })
}

module.exports = globalErrhandler