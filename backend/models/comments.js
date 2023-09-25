    const mongoose = require('mongoose');

    const {Schema} = mongoose;
    const commentSchema = new Schema({
        content:{type:String,required:true},
        blog:{type:mongoose.SchemaTypes.ObjectId, ref:'Blog'},
        author:{type:mongoose.SchemaTypes.ObjectId, ref:'User'}//reference m jo hum ny name likha ha wo hi name hum har schema k lie export b kr rahy hn to wo reference us ko kr raha ha automatically

    },
        {timestamps:true}
    );

    module.exports = mongoose.model('Comment',commentSchema, 'comments');
