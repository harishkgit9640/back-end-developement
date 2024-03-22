
// var nodemailer = require("nodemailer");
import nodemailer from 'nodemailer'


var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
        user: "harishstudio877@gmail.com",
        pass: "ihlhhewnvtvingmh",
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