const express = require('express');
const app = express();

app.use(express.json());

const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

// route test
app.get('/', (req, res) => {
  res.send('✅ Serveur Node fonctionne');
});

app.listen(3000, () => {
  console.log('🚀 Serveur lancé sur http://0.0.0.0:3000');
});
