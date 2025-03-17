import Plant from "../models/Plant.js";

// @desc    Get all plants
// @route   GET /api/plants
const getPlants = async (req, res) => {
  try {
    const plants = await Plant.find({ isActive: true });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get plant by ID
// @route   GET /api/plants/:id
const getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    res.json(plant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new plant
// @route   POST /api/plants
const createPlant = async (req, res) => {
  try {
    const plant = new Plant(req.body);
    const savedPlant = await plant.save();
    res.status(201).json(savedPlant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a plant
// @route   PUT /api/plants/:id
const updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    const updatedPlant = await Plant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedPlant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a plant
// @route   DELETE /api/plants/:id
const deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    // Soft delete - just mark as inactive
    plant.isActive = false;
    await plant.save();

    res.json({ message: "Plant removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getPlants, getPlantById, createPlant, updatePlant, deletePlant };
