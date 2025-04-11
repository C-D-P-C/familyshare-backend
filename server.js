// backend/server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

// ✅ Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:5500',               // Para pruebas locales
  'http://127.0.0.1:5500',
  'https://carlospatiño.site',           // ✅ Tu dominio real en producción
  'https://www.carlospatiño.site'        // (opcional, si usas www)
];

// ✅ Middleware CORS con verificación de origen dinámica
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS: ' + origin));
    }
  },
  credentials: true
}));

// Middleware de parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Carpeta pública para archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Sesión persistente con cookies
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,       // ⚠️ IMPORTANTE: true en producción con HTTPS
    sameSite: 'none'    // ⚠️ Necesario para compartir cookies entre dominios
  }
}));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando 🎉');
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});
