import { MailtrapClient } from "mailtrap";
import dotnet from "dotenv";

dotnet.config();

const token = process.env.MAILTRAP_TOKEN;

export const mailtrap = new MailtrapClient({
    token : TOKEN 
})

export const sender = {
    email : process.env.EMAIL_FROM,
    name : process.env.EMAIL_FROM_NAME,

}