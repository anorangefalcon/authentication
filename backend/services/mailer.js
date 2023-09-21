const nodemailer = require('nodemailer');

const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'testnodemailerapis@gmail.com',
        pass: 'eznt vjmy ctpx wngf'
    }
});

module.exports = {
    sendTheMail : async(req, res)=>{
        try {

            console.log(req, "idhar");
            let content = {
                from: 'noreply-falcon@gmail.com',
                to: req,
                subject: "Welcome to Falcon's Resume Saver",
                text: "Hello, Welcome to Falcon's Resume Saver. We are glad to have you on board. We hope you have a great experience with us. Thank you."
            }

            mailTransporter.sendMail(content, (err, res) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.status(200).json({
                        message: 'Email sent successfully'
                    });
                }
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
       
    }
}

