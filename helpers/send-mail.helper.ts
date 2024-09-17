import nodemailer from "nodemailer";

const sendMail = (email : String, subject : String, content: String) =>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
    });
      
    var mailOptions = {
        from: 'thaivcvl2002@gmail.com',
        to: email,
        subject: subject,
        html: content,
    };
      
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
}

export default sendMail;