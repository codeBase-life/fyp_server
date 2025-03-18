import mongoose from "mongoose";

const plantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    plantType: {
      type: String,
      required: true,
      // enum: ["flower", "vegetable", "fruit"],
    },
    plantCharacteristics: {
      type: String,
    },
    careRequirements: {
      watering: String,
      fertilization: String,
      pestControl: String,
    },
    ageRange: String,
    growthStages: [String],
  },
  {
    timestamps: true,
  }
);

const Plant = mongoose.model("Plant", plantSchema);

export default Plant;
