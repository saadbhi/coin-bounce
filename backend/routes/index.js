const express =require('express');
const authController =require('../controller/authController');
const blogController = require('../controller/blogController');
const commentController = require('../controller/commentController');
const auth = require('../middlewares/auth');
const router = express.Router();


//user

//register
router.post('/register',authController.register);  //going to authcontroller with all the data from the users

//login
router.post('/login',authController.login);
//logout
router.post('/logout',auth, authController.logout);//after hitting the logout route it first go to auth file then autcontroller.logout
// //refresh
router.get('/refresh', authController.refresh);
// //blog
// //create blog
router.post('/create', auth, blogController.create);
// //get all
router.get('/blog/all',auth, blogController.getAll);
// //get blog by id
router.get('/blog/:id',auth,blogController.getById);
// //update
router.put('/blog',auth,blogController.update);
// //delet
router.delete('/blog/:id',auth,blogController.delete);
// //comment
// //create
router.post('/comment',auth ,commentController.create);
// //get
router.get('/comment/:id',auth,commentController.getById);



module.exports= router;