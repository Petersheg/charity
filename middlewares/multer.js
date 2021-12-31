const multer = require('multer');
const OperationalError = require('../utility/operationalError');
const cloudinary = require("cloudinary");
const { CloudinaryStorage }= require("multer-storage-cloudinary");

exports.upload = multer({

    limits : {
        fileSize: 3000000
    },

    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(png|jpg|img|PNG|JPG|IMG)/)){
            return cb(new OperationalError("Kindly select a right format file"));
        }
        cb(undefined,true);
    }
});


cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME ,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET ,
});

const storage = new CloudinaryStorage({
    cloudinary:cloudinary ,
    params: {
        folder: "productImages",
        allowedFormats: ["jpg", "png"],
        // transformation: [{ width: 500, height: 500, crop: "limit" }]
    },
});

// const storage = multer.diskStorage({
//     filename: function (req, file, cb) {
//       cb(null, file.fieldname + "-" + Date.now());
//     },
// });

exports.uploadCloud = multer({storage: storage});