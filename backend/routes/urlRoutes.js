import express from "express";

import protect from "../middleware/auth.js";
import createUrlRateLimiter from "../middleware/rateLimiter.js";

import {
  createShortUrl,
  getUserUrls,
  deleteUrl,
  toggleUrl,
  getAnalytics
} from "../controllers/urlController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createUrlRateLimiter,
  createShortUrl
);

router.get(
  "/",
  protect,
  getUserUrls
);

router.delete(
  "/:id",
  protect,
  deleteUrl
);

router.patch(
  "/:id/toggle",
  protect,
  toggleUrl
);

router.get(
  "/:id/analytics",
  protect,
  getAnalytics
);

export default router;