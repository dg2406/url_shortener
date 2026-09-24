import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config.js";

import authRoutes from "./routes/authRoutes.js";
import urlRoutes from "./routes/urlRoutes.js";

import {
  redirectUrl
} from "./controllers/urlController.js";

import errorMiddleware from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

const allowedOrigin =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin
  })
);

app.use(
  express.json({
    limit: "10kb"
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "URL Shortener API running"
  });
});

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/urls",
  urlRoutes
);

app.get(
  "/:code",
  redirectUrl
);

app.use(
  (req, res) => {
    res.status(404).json({
      message: "Route not found"
    });
  }
);

app.use(
  errorMiddleware
);

const PORT =
  process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Server startup failed:",
      error
    );

    process.exit(1);
  }
};

startServer();