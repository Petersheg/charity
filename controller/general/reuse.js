const OperationalError = require('../../utility/operationalError');
const helperFunc = require('../../utility/helperFunc');
const _ = require('lodash');


exports.editController = async(req,res,next,toEdit,Model) => {

    const toEditId = req.params.Id;
    const toUpdate = req.body;

    if(!toEditId){
        return next(new OperationalError(`Kindly provide valid ${toEdit} Id`,400));
    }

    if(!toUpdate){
        return next(new OperationalError("You cannot send empty update",400));
    }

    if(toUpdate.password){
        return next(new OperationalError("You cannot update password using this route",406));
    }

    const updatedContent = await Model.findByIdAndUpdate(toEditId, toUpdate, {
        new : true,
        runVAlidators: true
    });

    if(!updatedContent){
        return next(new OperationalError("You might have provided a wrong Id, kindly check",400));
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
        return next(new OperationalError(`You must specify ${toDelete} Id`,400));
    }

    const ItemDeleted = await Model.findByIdAndDelete(toDeleteId);

    if(!ItemDeleted){
        return next(new OperationalError(`the ${toDelete} you are trying to delete does not exist`,404));
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
        return next(new OperationalError('this user does not exist',404));
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

exports.setPasswordToDefault = async(req,res,next,Model)=>{
    
    const userId = req.params.Id;
    if(!userId){
        return next(new OperationalError('kindly provide valid user id',400));
    }

    const user = await Model.findById(userId).select('password adminDefaultPass');

    if(!user){
        return next(new OperationalError('this user does not exist',404));
    }
    console.log(user);
    user.password = user.adminDefaultPass;
    await user.save({validateBeforeSave : false});
    
    res.status(200).json({
        status: 'success',
        message: 'password reset to default'
    });
}

exports.getController = async (req,res,next,toGetString,Model)=>{
    
    const toGetId = req.params.Id;

    let toGet;
    if(toGetId){
        toGet = Model
        .findById(toGetId)
        .select('-oneTimeToken -oneTimeTokenExpires -modeOfRegistration -accountStatus -registeredOn');
    }

    if(!toGetId){

        let filter;
        if(req.query){
            filter = {...req.query};
            filter =  _.omit(filter,['page','limit']);
        }

        toGet = Model
        .find(filter)
        .select('-oneTimeToken -oneTimeTokenExpires -modeOfRegistration -accountStatus -registeredOn');

    }

    items = await helperFunc.pagination(req,toGet);
    
    if(!items || items.length === 0){
        return next(new OperationalError(`${toGetString} is not available`,404));
    }

    res.status(200).json({
        message: `${toGetString} fetched successfully`,
        data:{
            total: items.length,
            items : items
        }
    })
}