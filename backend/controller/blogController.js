
const Joi = require("joi");
const fs = require("fs");
const Blog = require("../models/blogs");
const { BACKEND_SERVER_PATH } = require("../config/index");
const BlogDTO = require("../dto/blog");
const BlogDetailsDTO = require("../dto/blog-details");
const Comment = require("../models/comments");
// const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;


const blogController = {
  async create(req, res, next) {
    // 1. validate req body
    const createBlogSchema = Joi.object({
      title: Joi.string().required(),
      author: Joi.string().regex(mongodbIdPattern).required(),
      content: Joi.string().required(),
      photo: Joi.string().required(),
    });

    const { error } = createBlogSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { title, author, content, photo } = req.body;

    // 2. handle photo storage, naming
    // read as buffer (ye buffer nodejs ka ha)
    //reading photo through the buffer
    const buffer = Buffer.from(
      photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
      "base64"
    ); //exta part ko hum empty string sy replace krwa kr base4 string add kr rahy hn just

    // allot a random name
    const imagePath = `${Date.now()}-${author}.png`; //making a unique name

    // save to local system using file system
    try {
      fs.writeFileSync(`storage/${imagePath}`, buffer); //here this is the name (storage/${imagePath}`), and buffer  have the photo file
    } catch (error) {
      return next(error);
    }

    // 3. add to db

    // save to the mongo database
    let newBlog;
    try {
      newBlog = new Blog({
        title,
        author,
        content,
        photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
      });

      await newBlog.save();
    } catch (error) {
      return next(error);
    }
    const blogDto = new BlogDTO(newBlog);
    // 4. return response
    return res.status(201).json({ blog: blogDto });
  },

   async getAll(req, res, next) {
    //response the information of all the blogs
    try {
      //read data from database
      const blogs = await Blog.find({}); //this will read all the blogs in the database and assign to the blogs

      //create a array for stroring that data
      const blogsDto = [];

      for (i = 0; i < blogs.length; i++) {
        //using dto for safety
        const dto = new BlogDTO(blogs[i]); //assigning every object of blogDTO to dto and making taht an array

        blogsDto.push(dto); //putting  dto array into an array by using push
      }

      //responding
      return res.status(200).json({ blogs: blogsDto });
    } catch (error) {
      return next(error);
    }
  },
        async getById(req, res, next) {
        //first take id from the input and validate
        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required(),
        });
        const { error } = getByIdSchema.validate(req.params);
        if (error) {
            return next(error);
        }

        let blog;

        const { id } = req.params; //destructureing the id variable

        try {
            //search in database
            blog = await Blog.findOne({ _id: id }).populate("author"); //it will take the infromation of author and show all the author information not only the id of author balky all the information in author id
        } catch (error) {
            return next(error);
        }
        //return blog
        const blogDto = new BlogDetailsDTO(blog);

        //return blog to display
        return res.status(200).json({ blog: blogDto });
        },
  async update(req, res, next) {
//validate with schema

const updateBlogSchema =Joi.object({
  title:Joi.string().required(),
  content:Joi.string().required(),
  author:Joi.string().regex(mongodbIdPattern).required(),
  blogId:Joi.string().regex(mongodbIdPattern).required(),
  photo:Joi.string(),
})
const {error} = updateBlogSchema.validate(req.body);

const {title,content,author,blogId,photo}= req.body;

//find the blog
let blog;
try{
    blog  = await Blog.findOne({_id:blogId});
}catch(error){
  return next(error);
}

//if photo changed then change photo
if(photo){
  let previousPhoto = blog.photoPath;
  previousPhoto = previousPhoto.split("/").at(-1); // ye / k bad sy data pick kry ga end tk wo assign kry ga previous photo ko

  fs.unlinkSync(`storage/${previousPhoto}`); //delet kr dy ga wo wali photo s

//dealing with image format and storage
    //reading image as buffer in base64 format
  const buffer = buffer.from (photo.replace(/^data:image\/(png|jpg|jpeg):base64,/," "),"base64");
    //alog a random name
  const imagePath = `${Date.now()}-${author}.png`;

  try{
    fs.writeFileSync(`storage/${imagePath}`,buffer);
  }catch(error){
    return next(error);
  }

//updating the database with new photo and title and content
  await Blog.updateOne({_id:blogId},{
    title,content,photoPath: `${BACKEND_SERVER_PATH}/STORAGE/${imagePath}`
  });
}else{
    await Blog.updateOne({id: blogId},{title,content});
  }
  //send response
  return res.status(200).json({ message: "Blog updated"});


  },

  async delete(req, res, next) {
    
//validate id
//delet blog
//delet comments on this blog

//validation
const deletBlogSchema =Joi.object({
  id:Joi.string().regex(mongodbIdPattern).required(),
});

const {error} = deletBlogSchema.validate(req.params);

const {id} = req.params;

//delet blog

try{
  await Blog.deleteOne({ _id: id });
  await Comment.deleteMany({blog:id});
}catch(error){
  console.error("Error deleting blog:", error);
  return next(error);
}
//sending response
return res.status(200).json({message:"blog Deleted"});
  },

};
module.exports = blogController;


