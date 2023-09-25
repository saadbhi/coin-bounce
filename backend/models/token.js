
const mongoose =require('mongoose');

const {Schema} = mongoose;  //schema destructure kr lia

const refreshTokenSchema = Schema({ //refresh tocken  ko store krny k lie model  
    token:{type:String,required:true},
    userId: {type:mongoose.SchemaTypes.ObjectId,ref:'User'}
},
{timestaps:true}
);
module.exports=mongoose.model('RefreshToken',refreshTokenSchema,'tokens');