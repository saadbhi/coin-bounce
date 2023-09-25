const mongoose =require('mongoose');
const {MONGODB_CONNECTION_STRING}= require('../config/index')


const dbConnect = async () =>{
    try {//connecting to the database
       const conn= await mongoose.connect(MONGODB_CONNECTION_STRING);
       console.log(`database connected to the host:${conn.connection.host}`);
    }catch(error){
        console.log(`Error: ${error}`);
    }
}

module.exports =dbConnect;