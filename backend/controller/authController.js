const Joi = require("joi");
const User = require("../models/users"); //importing our collection(entire user database) in schema format
const bcrypt = require("bcryptjs");
const UserDto = require("../dto/user");
const JWTService = require("../services/JWTService");
const RefreshToken = require('../models/token');
const UserDTO = require("../dto/user");

passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController = {
  async register(req, res, next) {      //iss function tk hum aye hn, hmary pass sara data ha jo hum user sy ly k aye hn post request k through routes app k andr sy




    // 1. validate(format bnana) user input
    const userRegisterSchema = Joi.object({
      //defining the format which we need
      username: Joi.string().min(5).max(30).required(),
      name: Joi.string().max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattern).required(),
      confirmPassword: Joi.ref("password"),
    });
    const { error } = userRegisterSchema.validate(req.body);          //by using above model we will validate our request
    
    
    
    
    
    // 2. if error in validation -> return error via middleware(agr input theek na howa to tab)
    if (error) {
      return next(error);                 //ye move kr jaye ga middleware k andr error handler m with this error
    }
 



    // 3. if email or username is already registered -> return an error
    const { username, name, email, password } = req.body;       //user sy data ly k hum ny inn variables m store kr lia ha

    try {                               //we are using try catch to deal with database (taky hmari error handdling easy ho jaye)
      const emailInUse = await User.exists({ email });         //user hmari collection ha , format hmara joi k through define howa tha
      const usernameInUse = await User.exists({ username });

      if (emailInUse) {
        const error = {
          status: 409,
          message: "Email already registered,use another email!",
        };
        return next(error);
      }
      if (usernameInUse) {
        const error = {
          status: 409,
          message: "Username not available,chose another username!",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }



    // 4. password hash
    const hashdPassword = await bcrypt.hash(password, 10);




    // 5. store user data in db
    let accessToken;
    let refreshToken;

    let user;
    try {
      const userToRegister = new User({         //creating new user with mongodb database after above validation
        username,
        email,
        name,
        password: hashdPassword,
      });
      user = await userToRegister.save();         //save the new user to the database
      //token generation here
      accessToken = JWTService.signAccessToken({_id:user._id},'30m')
      refreshToken = JWTService.signRefreshToken({_id:user._id},'60m');
    } catch (error) {
      return(next);
    }
      //save the token in database
     await  JWTService.storeRefreshToken(refreshToken,user._id);

    res.cookie('accessToken',accessToken,{ //setting cookie limit ziad bari b na ho ziada choti b na ho
      maxAge:1000 * 60 * 60 * 24,
      httpOnly:true //for security, on cliendside javascript(browser)cannot access it
    });
    res.cookie('refreshToken',refreshToken,{
      maxAge:1000 * 60 * 60 * 24,
      httpOnly:true
    });


    // 6. response send
    const userDto = new UserDto(user);
    return res.status(201).json({ user:userDto, auth: true });
  },

  async login(req, res, next) {
    //1 :validate user input
    //2: if validation eror then return error
    //3: match username and password
    //4: return response

    //we expect user input data in such form
    const userLoginSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      password: Joi.string().pattern(passwordPattern),
    });

    //1: validating user input
    const { error } = userLoginSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { username, password } = req.body;

    let user;
    try {
      //matching the username
      user = await User.findOne({ username: username });
      if (!user) {
        const error = {
          status: 401,
          message: "invalid username",
        };
        return next(error);
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        const error = {
          status: 401,
          message: "invalid password",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    let accessToken;
    let refreshToken;

    accessToken = JWTService.signAccessToken({_id:user.id},"30m");
    refreshToken = JWTService.signRefreshToken({_id:user.id},"60m");
    
    try{
    
      //update  the refresh token in database
      await RefreshToken.updateOne({
        _id:  user.id,
      },
      { token:refreshToken},
      {upset: true}
      );
    }catch(error){
      return next(error);
    }

  
    res.cookie('accessToken',accessToken,{ //setting cookie limit ziad bari b na ho ziada choti b na ho
      maxAge:1000 * 60 * 60 * 24,
      httpOnly:true //for security, on cliendside javascript(browser)cannot access it
    });
    res.cookie('refreshToken',refreshToken,{
      maxAge:1000 * 60 * 60 * 24,
      httpOnly:true
    });


    const userDto = new UserDto(user);

    return res.status(200).json({ user: userDto, auth: true });
  },

  //logout function
  async logout(req, res, next){
    console.log(req);
    //delet refresh token from database
    const{refreshToken} =req.cookies;
    console.log(req);
    
    try{
    await RefreshToken.deleteOne({token:refreshToken});//database k andr jis ka ye wala token ha ussy delet kr do
    }
    catch(error){
      return next(error);
    }

    //delet cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");


    //response
    res.status(200).json({user:null, auth:false});


  },

  async refresh(req,res,next){
    //1. get refreshToken from cookies
    //2.verify refreshToken
    //3. generate new tokens
    //4. update db  return response
    
    const orignalRefreshToken = req.cookies.refreshToken;
    let id;
    try{
      id = JWTService.verifyRefreshToken(orignalRefreshToken)._id;
    }catch(e){
      const error ={
        status:401,
        message:"Unauthorized",
      };
      return next(error);
    }

    try{
      const match = RefreshToken.findOne({_id:id,token:orignalRefreshToken,});
      if(!match){
        const error= {
          status :401,
          message:"Unauthorized",
        };
        return next(error);
      }
    }catch(e){
      return next(error);
    }

    try{
      const accessToken =JWTService.signAccessToken({_id:id},"30m");
      const refreshToken =JWTService.signRefreshToken({_id:id},"60m");
      
      await RefreshToken.updateOne({_id:id},{token:refreshToken});

      res.cookie("accessToken",accessToken,{
        maxAge:1000*60*60*24,
        httpOnly:true,
      }
      );
      res.cookie("refreshToken",refreshToken,{
        maxAge:1000*60*60*24,
        httpOnly:true,
      });
    }catch(e){
      return next(error);
    }

    const user = await User.findOne({_id:id});
    const userDto = new UserDTO(user);
    return res.status(200).json({user:userDto,auth: true});

  },
};

module.exports = authController;
