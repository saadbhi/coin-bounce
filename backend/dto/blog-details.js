class blogDetailsDTO {
    constructor(blog){
        this._id= blog._id; 
        this.title= blog.title;
        this.content = blog.content;
        this.photo= blog.photoPath; 
        this.createdAt= blog.author.createdAt;
        this.authorName= blog.author.name;
        this.authorUsername= blog.author.username;

    }
}

module.exports= blogDetailsDTO;