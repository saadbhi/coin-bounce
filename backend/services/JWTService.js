 const jwt =require('jsonwebtoken');
 const {ACCESS_TOKEN_SECRET,REFRESH_TOKEN_SECRET}= require("../config/index");
 const RefreshToken =require('../models/token');


 class JWTService {


    //sign access token
        //creating a token by providing object and expiry time
    static signAccessToken(payload,expiryTime,){ //hmara bnaya howa function ha ye jwt ka nahe 
        console.log("signaccesstoken runed");
        return jwt.sign(payload,ACCESS_TOKEN_SECRET,{expiresIn:expiryTime});
    }
    //sign refresh token
    static signRefreshToken(payload,expiryTime,){
        return jwt.sign(payload,REFRESH_TOKEN_SECRET,{expiresIn:expiryTime});
    }
    //verify access token
            // user jab signup ya signin kry ga tb ussy token dain ge or user sy token ly k verify b karain ge
    static     verifyAccessToken(token){
            return jwt.verify(token,ACCESS_TOKEN_SECRET);
        }
    //verify refresh token
    static     verifyRefreshToken(token){
            return jwt.verify(token,REFRESH_TOKEN_SECRET)
        }


    //store refresh token only in mongodb database
            
        //database k andr hum refreshtoken hi save krain ge 
    static async storeRefreshToken(token,userId){
        //jab hum database sy communicate kr rahy hn tb hum try catch use krain ge 
        try{
            const newToken = new RefreshToken({ //created a model of mongo token 
                token:token,
                userId: userId
            });
                // store in db
            await newToken.save();

        }catch(error){
            console.log(error); 

        }
    }
 } 

 module.exports = JWTService;