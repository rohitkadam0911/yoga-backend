import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendEmail = async (email, otp) =>{
    try {
        
        const info = await transporter.sendMail({
            from: `"YogaConnect" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "YogaConnect OTP Verification",
            html: `
                <h2>Welcome to YogaConnect</h2>
                <p>Your OTP is: </p>
                <h1>${otp}</h1>
                <p>This OTP is valid for 10 minutes.</p>
            `
        });
        console.log("Email Sent :", info.messageId);
    } catch (error) {
        console.log(error.message);
    }
};