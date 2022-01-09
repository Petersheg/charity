const OperationalError = require('../../utility/operationalError');


exports.editController = async(req,res,next,toEdit,Model) => {

    const toEditId = req.params.Id;
    const toUpdate = req.body;

    if(!toEditId){
        return next(new OperationalError(`Kindly provide valid ${toEdit} Id`,402));
    }

    if(!toUpdate){
        return next(new OperationalError("You cannot send empty update",402));
    }

    if(toUpdate.password){
        return next(new OperationalError("You cannot update password using this route",402));
    }

    const updatedContent = await Model.findByIdAndUpdate(toEditId, toUpdate, {
        new : true,
        runVAlidators: true
    });

    if(!updatedContent){
        return next(new OperationalError("You might have provided a wrong Id, kindly check",402));
    }

    res.status(200).json({
        status: "success",
        message: `${toEdit} updated successfully`,
        data: {
            details: updatedContent
        }
    });
};

exports.deleteController = async(req,res,next,toDelete,Model)=>{

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

exports.setAccountStatus = async(req,res,next,Model)=>{
    const userId = req.params.userId;
    if(!userId){
        return next(new OperationalError('kindly provide valid user id',400));
    }

    const user = await Model.findById(userId);
    if(!user){
        return next(new OperationalError('this user does not exist'));
    }

    // Toggle account status.
    let status;
    if(user.accountStatus){
        user.accountStatus = false
        status = 'disabled';
    }else{
        user.accountStatus = true
        status = 'active';
    }
    await user.save();

    res.status(200).json({
        status : 'success',
        message: ` ${user.userRole} account is ${status}`,
    })
}