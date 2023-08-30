const nodeMailer = require('nodemailer');


exports.sendEmail = async (options) => {
    const transporter = nodeMailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "453d2b796cfd66",
      pass: "3cea93eb55c4c3"
    }

        
    });

    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    await transporter.sendMail(mailOptions);
}

// var transport = nodemailer.createTransport({
//     host: "sandbox.smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: "453d2b796cfd66",
//       pass: "3cea93eb55c4c3"
//     }
//   });