const OperationalError = require('../../utility/operationalError');


exports.editContent = async(req,res,next,returnValue,Model) => {

    const toEditId = req.params.Id;
    const toUpdate = req.body;

    if(!toEditId){
        return next(new OperationalError(`Kindly provide valid ${returnValue} Id`,402));
    }

    if(!toUpdate){
        return next(new OperationalError("You cannot send empty update",402));
    }

    const updatedContent = await Model.findByIdAndUpdate(toEditId, toUpdate, {
        new : true,
        runVAlidators: true
    });

    await updatedContent.save();

    res.status(200).json({
        status: "success",
        message: `${returnValue} updated successfully`,
        data: {
            details: updatedContent
        }
    });
};