const express = require("express");
const Drink = require("../models/Drinks");
const Ingredient = require("../models/Ingredient");
const { protect } = require("./userRoutes");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

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
router.post("/:id/rate", async (req, res) => {
  
  try {
    const { id } = req.params;
    const { type } = req.body;
    const drink = await Drink.findById(id);
    console.log(type)
    if (!drink) {
      return res.status(404).json({ message: "Drink not found" });
    }

    if (!drink.rating) {
      drink.rating = { thumbsUp: 0, thumbsDown: 0 };
    }

    if (type === "thumbsUp") {
      drink.rating.thumbsUp += 1;
    } else if (type === "thumbsDown") {
      drink.rating.thumbsDown += 1;
    }

    drink.markModified('rating');

    await drink.save();
    res.json(drink);
  } catch (error) {
    res.status(500).json({ message: "Error updating rating", error });
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

router.delete(
  "/ingredients/:id",
  protect,
  requireRole(["Admin"]),
  async (req, res) => {
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