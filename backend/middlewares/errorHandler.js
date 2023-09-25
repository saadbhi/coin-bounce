const {ValidationError}=require('joi');


//this is our middleware function , jahan p hum next(error) kr rahy hn wo sari request or error idr send kr raha ha
const errorHandler = (error,req,res,next)=>{ 
    

        // default error jab validation testing m next(error) wala code run ho gea tb ye default values return hon ge mtlb error mily ga hi milly ga
    let status =500;
    let data={//it's actually a json  jab wapis jaye ga
        message:'internal server error'
    }

        //agr hmara error ki type jo hum ny user sy lia tha, wo joi k validationError ki type sy match kr raha  ha ya nahe, muje lgta ha jesy hum us k format ki baat kr rahy hn k agr us format m data na ho tab
    if(error instanceof ValidationError){
        status =401;
        data.message = error.message;

        return res.status(status).json(data);
    }

        //agr just status mila ha error m phir just status change  kro
    if(error.status){
        status = error.status;
    }
    
    if(error.message){
        data.message = error.message;
    }
    return res.status(status).json(data);//ye response send ho ga jo b iss function ko use kary ga



}



module.exports =errorHandler;