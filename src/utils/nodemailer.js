import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();

function sendEmail(email, subject, message) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })

    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject,
        text: message,
    }

    transporter.sendMail(mailOptions)
}

export default sendEmail