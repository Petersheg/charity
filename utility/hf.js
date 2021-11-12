const Joi = require('joi');


class Helper{

    joiValidator(joiSchema,dataToValidate){
        return joiSchema.validate(dataToValidate);
    }

    generateJWT(id){
        return jwt.sign({id}, process.env.JWT_SECRET,{
            expiresIn : process.env.JWT_EXPIRES_IN
        });
    }

    generateTokenAndUserData(req,res,user){
        
    }
}

module.exports = new Helper();