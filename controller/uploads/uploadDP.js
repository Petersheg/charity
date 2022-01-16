const sharp = require('sharp');
const cloudinary = require('cloudinary');
const User = require('../../model/userModel');
const catchAsync = require('../../utility/catchAsync');
const OperationalError = require('../../utility/operationalError');

exports.uploadDP = catchAsync(
    async (req, res, next) => {

        const buffer = await sharp(req.file.buffer).png().toBuffer();

        if(!buffer) {
            return next(new OperationalError("something went wrong",400));
        }

        const user = req.user;
        user.profilePicture = buffer;
        user.save({runValidators : false});

        res.status(200).json({
            status: "success",
            message : "upload successful"
        })
    }
)

exports.getDP = catchAsync(
    async(req,res)=>{
        const user = await User.findById(req.user.id).select('+profilePicture');
        res.set("Content-type","image/png");
        res.send(user.profilePicture);
    }
)

exports.uploadProductIMG = catchAsync(
  async (req, res, next) => {

      try {
        
        let pictureFiles = req.files;
        console.log(pictureFiles);
        if (!pictureFiles)
          return res.status(400).json({ message: "No picture attached!" });
        
        //map through images and create a promise array using cloudinary upload function
        let multiplePicturePromise = pictureFiles.map((picture) =>{
          return cloudinary.v2.uploader.upload(picture.originalname);
        });

        let imageResponses = await Promise.all(multiplePicturePromise);
        
        res.status(200).json({
            images: imageResponses 
        });

      }catch (err) {
        res.status(500).json({
          message: err.message,
        });
      }
  }
)