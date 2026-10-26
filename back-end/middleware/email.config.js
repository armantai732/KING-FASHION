
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.join(__dirname, "../.env"),
});

if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html, text }) => {
    const { data, error } = await resend.emails.send({
        from: "King Fashion <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        text,
    });

    if (error) {
        console.error("Resend Email Error:", error);
        throw new Error(error.message || "Email sending failed");
    }

    console.log("Email sent successfully:", data?.id);
    return data;
};
