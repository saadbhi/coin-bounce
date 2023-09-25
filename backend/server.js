const express = require('express');
const dbConnect= require('./database/index');
const {PORT} =require('./config/index');
const router = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler.js');
const cookieParser =require('cookie-parser');
const app =express();

app.use(cookieParser());// to store the tokens

app.use(express.json());

app.use(router);

dbConnect(); 


app.use('/storage',express.static('storage'));//to access the local storeage images in the browser after making that folder static 
app.use(errorHandler); //ye middleware end m islie use kr rahy hn k hum response send krny sy pehly sari errorhandaling krna chahty hn keunky ye syncrouss function hoty hn 
app.listen(PORT, console.log(`backend is running on: ${PORT}` ));