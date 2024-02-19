import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

dotenv.config()

const {DB_HOST} = process.env;

import {contactsRouter} from "./routes/contactsRouter.js";
import { authRouter } from "./routes/authRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);
app.use("/api/auth", authRouter);

app.use('/public/avatars', express.static(join(__dirname, 'public', 'avatars')));

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error", code, name } = err;

  if(name === 'ValidationError'){
    return res.status(400).json({ message });
  }

  if(message.includes('E11000')){
    return res.status(400).json({ message: 'Dublicated key' });
  }

  res.status(status).json({ message });
});

mongoose.connect(DB_HOST)
.then(() => console.log("Database connection successful"))
.then(() => {
  app.listen(3000, () => {
    console.log("Server is running. Use our API on port: 3000");
  });
})
.catch((err) => {
  console.error(err.message)
  process.exit(1)
})