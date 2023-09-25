const Joi = require('joi');
const Comment = require("../models/comments");
const CommentsDto = require("../dto/comment");
const mongodbIdPattern =  /^[0-9a-fA-F]{24}$/;
//comment Controller object
const commentController= {
    
    //comment create
    async create(req,res,next){
        // validate comment
        const createCommentSchema= Joi.object({
            content: Joi.string().required(),
            author:Joi.string().regex(mongodbIdPattern).required(),
            blog:Joi.string().regex(mongodbIdPattern).required()
        })
        const {error} = createCommentSchema.validate(req.body);
        if(error){
            return next(error);
        }
        //get the comment data
        const {content,author,blog} = req.body;

        //create new comment
        try{
            const newComment = new Comment({
                content,
                author,
                blog
            });
         //save comment on database
            await newComment.save();

        }catch(error){
            return next(error);

        }
        //return message
        return res.status(200).json({message: "Comment Created"});
    },

    //Get comment by id on a blog
    async getById(req,res,next){
        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });
        //validate comment
        const {error} = getByIdSchema.validate(req.params);
        if(error){
            return next(error);
        }

        // take id  of blog
        const {id}= req.params;
        
        //find comments of blog and its author details
        let comments;

        try{
            comments= await Comment.find({blog:id}).populate('author');
        }catch(error){
            return next(error);
        }
        //create array 
        let commentsDto = [];

        for(i=0; i<comments.length; i++){
            const obj = new CommentsDto(comments[i]);
            // store all the  comments in the array it ads at the end of the array every data.
            commentsDto.push(obj);
        }
        // return comment data
        return res.status(200).json({data:commentsDto});


    }
    }

    module.exports = commentController;