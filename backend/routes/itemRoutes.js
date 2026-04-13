import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  createItem,
  deleteItem,
  getItem,
  getItems,
  updateItem,
} from "../controllers/itemsController.js";

const router = express.Router();

router.use(protect);

router.get("/", asyncHandler(getItems));
router.get("/:id", asyncHandler(getItem));
router.post("/", asyncHandler(createItem));
router.put("/:id", asyncHandler(updateItem));
router.delete("/:id", asyncHandler(deleteItem));

export default router;

