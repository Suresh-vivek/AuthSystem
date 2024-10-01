import express from "express";
import { connectDB } from "./db/connectDB.js";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// routes

app.use(express.json()); // allow us to parse incoming requesrts with JSON payloads

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("server is running on port ", PORT);
});

// 0Xeud9fRXo10KMcj  svivek
