const _ = require('lodash');
const jwt = require('jsonwebtoken');


class Helper{

    generateJWT(id){
        return jwt.sign({id}, process.env.JWT_SECRET,{
            expiresIn : process.env.JWT_EXPIRES_IN
        });
    }

    generateTokenAndUserData(statusCode,user,res,message){
        const userId = user._id;
    
        const token = jwt.sign({userId},process.env.JWT_SECRET,{
            expiresIn : process.env.JWT_EXPIRES_IN
        }) 
        
        res.cookie('token',token,{maxAge:24 * 60 * 60 * 1000}); //Expires After 24 hours

        // filter what client see
        user = _.pick(
        user,
        ['id','userFullName','userEmail','userName','userMobile','userFirstAddress',
        'userSecondAddress','userState','userCity','userRole','imageUrl','businessName','businessType','businessAddress']);

        res.status(statusCode).json({
            status : 'success',
            message,
            data : {
                token,
                user 
            }
        })
    }

    changeUserRoleToMerchant(req,user) {
        if(req.originalUrl.includes("merchants")){
            user.userRole="merchant";
            user.isVerifiedAsMerchant = false;
        }
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