const sharp = require('sharp');
const User = require('../../model/userModel');
const catchAsync = require('../../utility/catchAsync');
const OperationalError = require('../../utility/operationalError');

exports.uploadDP = catchAsync(
    async (req, res) => {

        try{
            const buffer = await sharp(req.file.buffer).resize({width: 500, height: 800}).png().toBuffer();
    
            const user = req.user;
            user.profilePicture = buffer;
            user.save({runValidators : false});
    
            res.status(200).json({
                status: "success",
                message : "upload successful"
            })
        }catch(err){
            console.log(err.message)
            return next(new OperationalError("something went wrong",400));
        }
    }
)

exports.getDP = catchAsync(
    async(req,res)=>{
        const user = req.user;
        res.set("Content-type","image/png");
        res.send(user.profilePicture);
    }
)