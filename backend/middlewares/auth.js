    const JWTService = require('../services/JWTService');
    const User = require('../models/users');
    const UserDTO = require('../dto/user');

const auth = async (req, res ,next) =>{

    
    //1 refresh &  access token validation(k mojood han ya nai)
    try{
    const {refreshToken,accessToken}=req.cookies;

        if(!refreshToken || !accessToken){
            const error = {
                status:401,
                message: 'Auth function ko  Refresh or access token nai mila '
            }
            return next(error);
        }
    
        let id;
        try{
            id = JWTService.verifyAccessToken(accessToken)._id;
        }
        catch(error){
            return next(error);
        }
    let user;
    try{
        user  = await User.findOne({_id:id}); //this will return the object
    }catch(error){
    
        return next(error);
    }
    const userDto = new UserDTO(user);
    req.user= userDto;//we have now controll over the req.user for the /logout routes
        next();
    }
    catch(error){
        return next(error);
    }
}
module.exports = auth;