const multer = require('multer');
const OperationalError = require('../utility/operationalError');

exports.upload = multer({

    limits : {
        fileSize: 3000000
    },

    fileFilter(_,file,cb){
        if(!file.originalname.match(/\.(png|jpg|img|PNG|JPG|IMG)/)){
            return cb(new OperationalError("Kindly select a right format file"));
        }

        cb(undefined,true);
    }
});