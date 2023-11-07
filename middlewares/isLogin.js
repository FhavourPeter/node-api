const appErr = require("../helper/appErr");
const getTokenFromHeader = require("../helper/getTokenFromHeader")
const verifyToken = require("../helper/verifyToken")

const isLogin = (req,res,next) =>{
    //get token from header
    const token = getTokenFromHeader(req)
    //verify token
    const decodedUser = verifyToken(token)
    //save user id
     req.userAuth = decodedUser.id
    if(!decodedUser){
        return next(appErr('Invalid/Expired token, please login again', 400))

    }else{
        next()
    }
}


module.exports = isLogin;

