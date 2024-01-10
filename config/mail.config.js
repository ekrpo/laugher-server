import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
        user: 'instaclone02@gmail.com', 
        pass: 'nrjm iykx axuk yenz ' 
    }
});

export default transporter