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

    pagination(req,query){
        // Implement Pagination
        const pages = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const skip = (pages - 1) * limit;

        query = query?.skip(skip).limit(limit);
        return query;
    }
}

module.exports = new Helper();