const _ = require('lodash');
const jwt = require('jsonwebtoken');
const template = require('./emails/templates');
const sendEmail = require('./emails/email');
const sendGridEmail = require('./emails/sendGridEmail');

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

    async sendVerificationEmail(user){
        
        const oneTimeToken = user.generateOneTimeToken(62 * 60) // 3 days validity
        await user.save({validateBeforeSave : false}); //save changes to model

        // Send token to the provided email
        const activateURL = `${process.env.REDIRECT_URL}/verify_email/?token=${oneTimeToken}`;

        let emailObj = {
            user,
            greeting : "WELCOME",
            heading : `KINDLY VERIFY YOUR EMAIL.`,

            message : `A warm welcome to PICKORDER, We are glad to have you here,
                        you have taken the first step, complete the next by verifying your 
                        email address to complete your registration.
                        Kindly click on the verify button bellow to complete your registration.`,

            link : activateURL,
            buttonText : "VERIFY",
    
        }

        const html =  template.generateTemplate(emailObj)

        let sentStatus;

        try{

            if(process.env.NODE_ENV === "development"){
                // Send to a mail trap
                sentStatus = await sendEmail({
                    email : user.userEmail,
                    subject : 'Activate your Email (Expires After 3 days)',
                    html
                });
                
            }else{
                // send to actual mail
                sentStatus = await sendGridEmail({
                    email : user.userEmail,
                    subject : 'Activate your Email (Expires After 3 days)',
                    html
                });
    
            }

            return sentStatus;

        }catch(err){
            console.log(`Sending email fail ${err.message}`);
            return sentStatus = err.message
        }
    }
}

module.exports = new Helper();