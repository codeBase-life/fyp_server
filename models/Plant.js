import mongoose from "mongoose";

const plantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    scientificName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    plantType: {
      type: String,
      required: true,
      enum: ["Flower", "Vegetable", "Fruit"],
    },
    careInstructions: {
      watering: {
        frequency: String,
        notes: String,
      },
      sunlight: {
        type: String,
        enum: [
          "Full Sun",
          "Partial Sun",
          "Shade",
          "Partial Shade",
          "Full Shade",
        ],
      },
      soil: String,
    },
    growthStages: [
      {
        name: String,
        description: String,
      },
    ],
    images: [
      {
        url: String,
        caption: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Plant = mongoose.model("Plant", plantSchema);

export default Plant;
