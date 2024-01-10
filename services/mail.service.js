import transporter from "../config/mail.config.js";
import { errorHandler } from "../middlewares/error.middleware.js";
import { SendingMailError } from "../utils/errors.js";


export function sendVerificationMail(req, res){
  try {
    // Define HTML content what users have to see in their emails
    const htmlContent = `
    <h1> Wellcome to Laugher </h1>
    <p> You entered your data successufully, there is only one step left to be online.
    To verificate your account you need to enter this 6-digit code in appropiate place in Laugher page:</p>
    <h2>${req.verificationCode}</h2>
    `
    // Single mail configuration options
    const mailOptions = {
        from: 'instaclone02@gmail.com',
        to: req.userEmail,
        subject: 'Mail Verification',
        html: htmlContent
      };
      // Try to send mail
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) { //Throw error to the user
            throw new SendingMailError(error.message, 500)
        }
        //Make response of success
        return res.status(200).json({
          redirectUrl: '/auth/email-verification',
          message: 'Successfully sent email',
        });
      });
      

  } catch (error) {
    req.error = error
    errorHandler(req, res)
  }

}
