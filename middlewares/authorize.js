const OperationalError = require('../utility/operationalError');

exports.authorize = (...userRole)=>{
       return (req,res,next)=>{

        if(!userRole.includes(req.user.userRole)){
            return next (new OperationalError('You are not authorized to perform this action'))
        }

        next();
    }
}