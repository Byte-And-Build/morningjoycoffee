const express = require("express");
const Drink = require("../models/Drinks");
const Ingredient = require("../models/Ingredient");
const { protect } = require("./userRoutes");
const requireRole = require("../middleware/requireRole");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error("Missing AWS credentials in environment");
}

const s3Client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Get all drinks
router.get("/", async (req, res) => {
  try {
    const drinks = await Drink.find().populate("sizes.ingredients.ingredientId").populate("extras.ingredientId");
    res.status(200).json(drinks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch drinks" });
  }
});

router.get("/ingredients", async (req, res) => {
  try {
    const Ingredients = await Ingredient.find();
    res.status(200).json(Ingredients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch ingredients" });
  }
});

router.post("/editIngredient", protect, requireRole(["Admin"]), async (req, res) => {
  try {
    const { _id, ...rest } = req.body;
    console.log(_id)
    const updated = await Ingredient.findByIdAndUpdate(_id, rest, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Edit ingredient error:", error);
    res.status(500).json({ message: "Failed to update ingredient" });
  }
});

router.get("/supplies", protect, requireRole(["Admin", "Employee"]), async (req, res) => {
  try {
    const supplies = await Ingredient.find();
    res.json(supplies);
  } catch (err) {
    console.error("Failed to get supplies:", err);
    res.status(500).json({ message: "Failed to fetch supplies" });
  }
});

router.post("/upload/presign", protect, async (req, res) => {
  const { fileName, fileType, clientFolder } = req.body;

  console.log(req.body)

  const key = `clients/${clientFolder}/images/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: "bytenbuild",
    Key: key,
    ContentType: fileType,
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    res.send({ url: uploadUrl });
  } catch (err) {
    console.error("Presign URL error:", err);
    return res.status(500).json({ message: "Could not generate upload URL", error: err.message });
  }
});

// Get a single drink by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const drink = await Drink.findById(id).populate("sizes.ingredients.ingredientId").populate("extras.ingredientId");
    if (!drink) {
      return res.status(404).json({ message: "Drink not found" });
    }
    res.json(drink);
  } catch (error) {
    res.status(500).json({ message: "Error fetching drink", error });
  }
});

// Update thumbs-up or thumbs-down count
router.post("/:id/rate", protect, async (req, res) => {
  console.log(req.body)
  const session = await mongoose.startSession();

  try {
    const { id: drinkId } = req.params;
    const { type } = req.body;
    const userId = req.user._id;

    console.log("type", type)
    console.log("user", userId)

    if (!["thumbsUp", "thumbsDown"].includes(type)) {
      return res.status(400).json({ message: "Invalid rating type" });
    }

    session.startTransaction();

    const drink = await Drink.findById(drinkId).session(session);
    if (!drink) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Drink not found" });
    }

    if (!drink.rating) drink.rating = { thumbsUp: 0, thumbsDown: 0 };

    const existing = await DrinkRating.findOne({ drinkId, userId }).session(session);

    // Case A: first time rating
    if (!existing) {
      await DrinkRating.create([{ drinkId, userId, type }], { session });

      if (type === "thumbsUp") drink.rating.thumbsUp += 1;
      else drink.rating.thumbsDown += 1;

      drink.markModified("rating");
      await drink.save({ session });

      await session.commitTransaction();
      return res.json({
        rating: drink.rating,
        userRating: type,
        changed: false,
      });
    }

    // Case B: same rating again → block spam
    if (existing.type === type) {
      await session.commitTransaction();
      return res.status(409).json({
        message: "You already rated this drink",
        rating: drink.rating,
        userRating: existing.type,
      });
    }

    // Case C: change vote (optional feature)
    const prevType = existing.type;
    existing.type = type;
    await existing.save({ session });

    // decrement old
    if (prevType === "thumbsUp") drink.rating.thumbsUp = Math.max(0, drink.rating.thumbsUp - 1);
    else drink.rating.thumbsDown = Math.max(0, drink.rating.thumbsDown - 1);

    // increment new
    if (type === "thumbsUp") drink.rating.thumbsUp += 1;
    else drink.rating.thumbsDown += 1;

    drink.markModified("rating");
    await drink.save({ session });

    await session.commitTransaction();
    return res.json({
      rating: drink.rating,
      userRating: type,
      changed: true,
    });
  } catch (error) {
    try { await session.abortTransaction(); } catch {}
    return res.status(500).json({ message: "Error updating rating", error });
  } finally {
    session.endSession();
  }
});

router.post("/addIngredient", protect, requireRole(["Admin"]), async (req, res) => {
  try {
    const newIngredient = new Ingredient(req.body);
    await newIngredient.save();
    res.status(201).json(newIngredient);
  } catch (error) {
    console.error("Add ingredient error", error);
    res.status(500).json({ message: "Failed to add ingredient" });
  }
});

router.delete("/ingredients/:id", protect, requireRole(["Admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Ingredient.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      res.status(200).json({ message: "Ingredient deleted", _id: id });
    } catch (error) {
      console.error("Delete ingredient error:", error);
      res.status(500).json({ message: "Failed to delete ingredient" });
    }
  }
);


router.post("/addInventory", protect, requireRole(["Admin"]), async (req, res) => {
  try {
    const newDrink = new Drink(req.body);
    await newDrink.save();
    res.status(201).json(newDrink);
  } catch (error) {
    console.error("Add error", error);
    res.status(500).json({ message: "Failed to add drink" });
  }
});

router.post("/editInventory", protect, requireRole(["Admin", "Employee"]), async (req, res) => {
  console.log(req.body)
  try {
    const { _id, ...rest } = req.body;
    const updated = await Drink.findByIdAndUpdate(_id, rest, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Edit error", error);
    res.status(500).json({ message: "Failed to edit drink" });
  }
});

router.post("/deleteInventory", protect, requireRole(["Admin"]), async (req, res) => {
  try {
    const { _id } = req.body;
    const deleted = await Drink.findByIdAndDelete(_id);
    if (!deleted) {
      return res.status(404).json({ message: "Drink not found" });
    }
    res.status(200).json({ message: "Drink deleted", _id });
  } catch (error) {
    console.error("Delete error", error);
    res.status(500).json({ message: "Failed to delete drink" });
  }
});


module.exports = router;