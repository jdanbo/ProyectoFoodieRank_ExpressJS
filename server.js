require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./src/config/database');
const passport = require('./src/config/passport');
const authRoutes = require('./src/routes/v1/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting (evitar abusos de peticiones)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { ok: false, message: 'Demasiadas peticiones desde esta IP, intente más tarde.' }
});

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(passport.initialize());

// Rutas versionadas (SemVer v1)
app.use('/api/v1/auth', authRoutes);

// Endpoint de prueba de salud
app.get('/api/v1/health', (req, res) => {
  res.json({ ok: true, version: '1.0.0', status: 'Servidor en línea' });
});

// Iniciar servidor y conectar a Mongo
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});