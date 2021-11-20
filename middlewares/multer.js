const multer = require('multer');

exports.upload = multer({

    limits : {
        fileSize: 3000000
    },

    fileFilter(_,file,cb){
        if(!file.originalname.match(/\.(png|jpg|img|PNG|JPG|IMG)/)){
            return cb(new Error("Kindly select a right format file"));
        }

        cb(undefined,true);
    }
});