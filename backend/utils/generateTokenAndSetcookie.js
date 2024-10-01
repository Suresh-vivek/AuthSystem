import jwt from "jsonwebtoken";

export const generateTokenAndSetcookie = (res, userId) => {
  // payload , secret , options

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // set cokie => name , token
  res.cookie("token", token, {
    httpOnly: true, // prevent XSS attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevent  CSRF

    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};
