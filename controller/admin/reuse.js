const OperationalError  = require('../../utility/operationalError');

exports.deleteController = async(req,res,next,Model,toDelete)=>{

    const toDeleteId = req.params.Id;

    if (!toDeleteId) {
        return next(new OperationalError(`You must specify ${toDelete} Id`));
    }

    const ItemDeleted = await Model.findByIdAndDelete(toDeleteId);

    if(!ItemDeleted){
        return next(new OperationalError(`the ${toDelete} you are trying to delete does  not exist`,400));
    }

    res.status(200).json({
        status : 'success',
        message: `${toDelete} deleted successfully`
    })
}