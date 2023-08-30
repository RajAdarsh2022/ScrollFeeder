const User = require('../models/User');
const jwt = require('jsonwebtoken');

//This middleware will check if the user is logged in or not
exports.isAuthenticated = async (req, res, next) => {
    try{
        const {token} = req.cookies;
        if(!token){
            return res.status(401).json({
                message:"You need to login first"
            });
        }
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        req.user = await User.findById(decoded._id);
        next();
    }catch(error){
        res.status(500).json({
            message:error.message
        })
    }


}