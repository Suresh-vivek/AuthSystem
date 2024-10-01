import { mailtrapClient, sender } from "./mailtrap.config.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplates.js";
export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email verification",
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending verification email : ", error);
    throw new Error("Error sending verification email : ", error);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "abe770b3-5a06-41f9-8d00-a2162eb27603",
      template_variables: {
        name: name,
        company_info_name: "Vivek auth project",
      },
    });

    console.log("Welcome Email sent successfully", response);
  } catch (error) {
    console.error("Error sending Welcome email : ", error);
    throw new Error("Error sending Welcome email : ", error);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset ",
    });
  } catch (error) {
    throw new Error("Error sending password reset email : ", error);
  }
};

export const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password reset Success",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset Success",
    });

    console.log("Password reset success email sent successfully", response);
  } catch (error) {
    throw new Error("Error sending password reset success email : ", error);
  }
};
