const express = require("express");
const router = express.Router();
const Process = require("../models/Process");
const protect = require("../middleware/authMiddleware");
const processController = require("../controllers/processController");

// Yeni süreç oluşturma
router.post("/", protect, async (req, res) => {
  const { name, xmlData } = req.body;
  try {
    const process = await Process.create({
      user: req.user,
      name,
      xmlData,
    });
    res.status(201).json(process);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

router.post("/add", processController.addProcess);

// Kullanıcının süreçlerini getirme
router.get("/", protect, async (req, res) => {
  try {
    const processes = await Process.find({ user: req.user });
    res.json(processes);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
