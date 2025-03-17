import express from "express";
import {
  getPlants,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant,
} from "../controllers/plantController.js";

const router = express.Router();

// @route   GET /api/plants
// @route   POST /api/plants
router.route("/").get(getPlants).post(createPlant);

// @route   GET /api/plants/:id
// @route   PUT /api/plants/:id
// @route   DELETE /api/plants/:id
router.route("/:id").get(getPlantById).put(updatePlant).delete(deletePlant);

export default router;
