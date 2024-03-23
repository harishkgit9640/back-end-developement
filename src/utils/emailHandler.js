
// var nodemailer = require("nodemailer");
import nodemailer from 'nodemailer'


var transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

var mailOptions = {
    // from: "usdnflskjdf@gmail.com",
    // to: "noeyedinesh123@gmail.com",
    to: "melusahu0143@gmail.com",
    subject: "Sending Email using Node.js",
    text: "this is harish from backend",
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log("Email sent: " + info.response);
    }
});