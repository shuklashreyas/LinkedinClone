import { mailtrap,sender } from "../lib/mailtrap";

export const sendWelcomeEmail = (email, name, profileUrl) => {
   const recipient = [{email}];

   try {
       const response = mailtrap.sendEmail({
           from : sender,
           to : recipient,
           subject : "Welcome to LinkedIn-Clone",
       });
   }

    catch(err){
         console.log("error in sending email", err.message);
    }
}