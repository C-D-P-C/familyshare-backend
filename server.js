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

// Configuración flexible de CORS
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://tudominio.com',           // Reemplaza esto por tu dominio real en Hostinger
  'https://www.tudominio.com'        // Con www si aplica
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Carpeta pública para descargas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sesiones con cookies
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando 🎉');
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});
