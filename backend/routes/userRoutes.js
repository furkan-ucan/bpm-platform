const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

// Kullanıcı Kaydı
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Kullanıcının zaten var olup olmadığını kontrol et
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Kullanıcı zaten kayıtlı" });
    }
    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);
    // Yeni kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    // JWT token oluştur
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Kullanıcı Giriş
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Geçersiz kimlik bilgileri" });
    }
    // Şifreyi kontrol et
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Geçersiz kimlik bilgileri" });
    }
    // JWT token oluştur
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
