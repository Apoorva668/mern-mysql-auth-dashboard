import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { stats } from "../controllers/itemsController.js";

const router = express.Router();

router.get("/", protect, asyncHandler(stats));

export default router;

