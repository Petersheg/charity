const User = require('../../../model/userModel');
const catchAsync = require('../../../utility/catchAsync');
const helperFunction = require('../../../utility/helperFunc');

exports.googleOAuth2 = catchAsync(
    async (req, res, next) =>{

        const profileObj = req.body.profileObj;

        const {email,name,imageUrl} = profileObj;
        // Autogenerate userName
        const userName = email.split('@')[0];
        // check if user already exists
        const findUser = await User.findOne({userEmail: email});
        
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