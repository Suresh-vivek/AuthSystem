import { MailtrapClient } from "mailtrap";

const TOKEN = "7953324266abc7835321dbe2a6e16c0f";

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@vivekportfolio.co",
  name: "Mailtrap Test",
};
// const recipients = [
//   {
//     email: "svivek.kumar012@gmail.com",
//   },
// ];

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);
