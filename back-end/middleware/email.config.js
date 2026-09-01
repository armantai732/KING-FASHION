import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({path: path.join(__dirname, "../.env"),
})


export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// const sendEmail = async () => {
//     try {
//         const info = await transporter.sendMail({
//             from: `"King Fashion Viramgam" <${process.env.EMAIL_USER}>`, // sender address
//             to: "taimunna722@gmail.com", // list of recipients
//             subject: "Hello", // subject line
//             text: "Hello world?", // plain text body
//             html: "<b>Hello world</b>", // HTML body
//         });
//         console.log(info)
//     } catch (error) {
//         console.log(error)
//     }
// }

// sendEmail()