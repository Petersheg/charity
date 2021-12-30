const User = require('../../../model/userModel');
const catchAsync = require('../../../utility/catchAsync');
const helperFunction = require('../../../utility/helperFunc');
const OperationalError = require('../../../utility/operationalError');


exports.googleOAuth2 = catchAsync(
    async (req, res, next) =>{

        let findUser,imageUrl;
        const profileObj = req.body.profileObj;
        const {email,name} = profileObj;

        if(!email){
            return next(new OperationalError("You can not login with this option, because your email is missing",400));
        }

        if(req.originalUrl.includes("/oauth/facebook")){
            imageUrl = profileObj.picture.data.url;
        }

        if(req.originalUrl.includes("/oauth/google")){
            imageUrl = profileObj.imageUrl;
        }
        
         // Autogenerate userName
         userName = email.split('@')[0];
         // check if user already exists
         findUser = await User.findOne({userEmail: email});

        if(findUser){
            helperFunction.generateTokenAndUserData(200,findUser,res,"login successful");
        }

        if(!findUser){
            const newUser = new User({
                userFullName : name,
                userName,
                userEmail : email,
                imageUrl,
                emailConfirmationStatus : true
            })
            helperFunction.changeUserRoleToMerchant(req,newUser);
            await newUser.save({validateBeforeSave : false});

            helperFunction.generateTokenAndUserData(200,newUser,res,"sign up successful");
        }

    }
)