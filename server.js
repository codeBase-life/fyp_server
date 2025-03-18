import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

const PORT = process.env.PORT || 5000;
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Plant from "./models/Plant.js";
import { getPlantDetials } from "./PlantDetails.js";

dotenv.config();

// Connect to database
connectDB();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>server running </h1>");
});
app.get("/api/users/validate", (req, res) => {
  const { email, password } = req.query;

  const fetch_data = async () => {
    try {
      const data = await User.findOne({
        email: email,
        password: password,
      }).select("password email -_id");
      if (!data) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password",
        });
      }
      res.json({
        success: true,
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error("error fetching users", error);
      res.status(500).json({
        success: false,
        message: "server error",
      });
    }
  };
  fetch_data();
});

app.post("/api/users/register", (req, res) => {
  try {
    const { email, password, userType, firstName, lastName } = req.body;
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      userType,
    });
    const updateUser = async () => {
      await newUser.save();
    };
    updateUser();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("error reqistering the user", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
  }
});

// getting plant details
app.post("/api/plantData", (req, res) => {
  try {
    const {
      name,
      type,
      age,
      water,
      pestcontrol,
      characteristics,
      stages,
      fertilization,
    } = req.body;
    const newPlant = new Plant({
      name,

      plantType: type, // Map to required field
      plantCharaceristics: characteristics, // Optional additional field

      careRequirements: {
        watring: water, // Note: schema has "watring" misspelled
        fertilization,
        pestControl: pestcontrol, // Fix case sensitivity
      },

      ageRange: age, // Map to schema field
      growthStages: [stages], // Convert to array as required by schema
    });

    const updatePlant = async () => {
      await newPlant.save();
    };
    updatePlant();
    res.status(201).json({ message: "plant save successfully" });
  } catch (error) {
    console.error("error saving plant data", error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
