const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendAnyEmail = async (options)=>{

    const msg = {
        from: 'petersheg@gmail.com',
        to : options.email,
        subject : options.subject,
        html : options.html,
    }
     
    if(await sgMail.send(msg)){
        return true;
    }else{
        return false;
    }  
};

module.exports = sendAnyEmail;