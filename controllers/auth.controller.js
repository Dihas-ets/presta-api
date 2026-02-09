require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../models'); // Sequelize index.js



// 1️⃣ REGISTER
exports.register = async (req, res) => {
  const { role, username, phone, pin, confirmPin } = req.body;

  // 1️⃣ Vérification des champs
  if (!role || !username || !phone || !pin || !confirmPin) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
  }

  if (role !== 'prestataire' && role !== 'client') {
    return res.status(400).json({ message: 'Rôle invalide' });
  }

  if (pin !== confirmPin) {
    return res.status(400).json({ message: 'Les PIN ne correspondent pas' });
  }

  if (pin.length !== 6) {
    return res.status(400).json({ message: 'Le PIN doit contenir 6 chiffres' });
  }

  try {
    // 2️⃣ Vérifier si le téléphone existe
    const existingUser = await db.User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(409).json({ message: 'Numéro déjà utilisé' });
    }

    // 3️⃣ Hash du PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // 4️⃣ Créer l’utilisateur
    const newUser = await db.User.create({
      role,
      username,
      phone,
      pin: hashedPin,
    });

    return res.status(201).json({ message: 'Inscription réussie', userId: newUser.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 1️⃣ LOGIN
exports.login = async (req, res) => {
  const { phone, pin } = req.body;

  // 1️⃣ Vérification des champs
  if (!phone || !pin) {
    return res.status(400).json({ message: 'Numéro et PIN sont obligatoires' });
  }

  try {
    // 2️⃣ Chercher l’utilisateur
    const user = await db.User.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({ message: 'Numéro inconnu' });
    }

    // 3️⃣ Comparer le PIN avec le hash
    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) {
      return res.status(401).json({ message: 'PIN incorrect' });
    }

    // 4️⃣ Générer un JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 5️⃣ Réponse
    return res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
