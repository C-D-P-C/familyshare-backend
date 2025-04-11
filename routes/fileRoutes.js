// backend/routes/fileRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fileController = require('../controllers/fileController');

// Configurar almacenamiento con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // carpeta donde se guardan los archivos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Rutas
router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/mine', fileController.getMyFiles); // obtener archivos del usuario logueado
router.post('/share', fileController.shareFile);
router.get('/shared', fileController.getSharedWithMe);

module.exports = router;
