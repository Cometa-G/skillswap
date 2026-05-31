const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const Skill = require("../models/skills");

// CREATE SKILL (tutor)
router.post("/", auth, async (req, res) => {
  try {
    const skill = await Skill.create({
      tutor: req.user.id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      availability: req.body.availability
    });

    res.status(201).json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL SKILLS (students browse)
router.get("/", async (req, res) => {
  try {
    const skills = await Skill.find().populate("tutor", "username role");
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;