import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { User } from "../models/user.model.js";

import { generateVerificationCode } from "../utils/ generateVerificationCode.js";
import { generateTokenAndSetcookie } from "../utils/generateTokenAndSetcookie.js";

import { sendVerificationEmail } from "../mailtrap/email.js";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../mailtrap/email.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // validation
    if (!email || !password || !name) {
      throw new Error("All Fields are required");
    }

    // check if user already exists
    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Hashing Password
    const hashedPassword = await bcryptjs.hash(password, 10);

    const verificationToken = generateVerificationCode();

    // create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    // save user
    await user.save();

    // jwt token
    generateTokenAndSetcookie(res, user._id);

    //send verification email
    await sendVerificationEmail(user.email, verificationToken);

    // send response

    res.status(201).json({
      success: true,
      message: "user created Successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  // getting verification code
  const { code } = req.body;

  try {
    // find user
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    // check user
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired Vericification code",
      });
    }

    // verify user

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Welcome Email sent",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {}
};
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // validation
    if (!email || !password) {
      throw new Error("All fields are required");
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // compare password

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    generateTokenAndSetcookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in Successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in login ", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const logout = async (req, res) => {
  // clear cookie
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // find user
    const user = await User.findOne({ email });

    // check user
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // generate reset token

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    // update the database
    await user.save();

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );
    console.log(`${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
   
    const { password } = req.body;


    // check that password is provided and token is not expired yet , expiry of token is 1 hr from password reset request link

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    console.log("user ", user);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // update passwword
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    console.log("Hi");

    // save user

    await user.save();
    console.log("Bye");

    await sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
