// backend/controllers/fileController.js
const pool = require('../db');
const path = require('path');

// SUBIR ARCHIVO
exports.uploadFile = async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió ningún archivo' });
  }

  try {
    const { originalname, filename, mimetype } = req.file;

    await pool.query(
      'INSERT INTO files (uploader_id, filename, original_name, file_type) VALUES (?, ?, ?, ?)',
      [user.id, filename, originalname, mimetype]
    );

    res.status(201).json({ message: 'Archivo subido exitosamente' });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ message: 'Error al subir archivo' });
  }
};

// OBTENER ARCHIVOS DEL USUARIO
exports.getMyFiles = async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, original_name, filename, file_type, uploaded_at FROM files WHERE uploader_id = ? ORDER BY uploaded_at DESC',
      [user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    res.status(500).json({ message: 'Error al obtener archivos' });
  }
};

// COMPARTIR ARCHIVO CON OTRO USUARIO
exports.shareFile = async (req, res) => {
    const user = req.session.user;
  
    if (!user) {
      return res.status(401).json({ message: 'No autorizado' });
    }
  
    const { fileId, shareWithUserId } = req.body;
  
    if (!fileId || !shareWithUserId) {
      return res.status(400).json({ message: 'Faltan datos' });
    }
  
    try {
      // Verifica que el archivo le pertenezca al usuario actual
      const [files] = await pool.query(
        'SELECT * FROM files WHERE id = ? AND uploader_id = ?',
        [fileId, user.id]
      );
  
      if (files.length === 0) {
        return res.status(403).json({ message: 'No tienes permiso para compartir este archivo' });
      }
  
      // Compartir el archivo
      await pool.query(
        'INSERT INTO shared_files (file_id, shared_with_user_id) VALUES (?, ?)',
        [fileId, shareWithUserId]
      );
  
      res.json({ message: 'Archivo compartido exitosamente' });
    } catch (error) {
      console.error('Error al compartir archivo:', error);
      res.status(500).json({ message: 'Error al compartir archivo' });
    }
  };
  

  // VER ARCHIVOS COMPARTIDOS CONMIGO
exports.getSharedWithMe = async (req, res) => {
    const user = req.session.user;
  
    if (!user) {
      return res.status(401).json({ message: 'No autorizado' });
    }
  
    try {
      const [rows] = await pool.query(
        `SELECT f.id, f.original_name, f.filename, f.file_type, f.uploaded_at, u.name AS uploader_name
         FROM shared_files s
         JOIN files f ON s.file_id = f.id
         JOIN users u ON f.uploader_id = u.id
         WHERE s.shared_with_user_id = ?
         ORDER BY f.uploaded_at DESC`,
        [user.id]
      );
  
      res.json(rows);
    } catch (error) {
      console.error('Error al obtener archivos compartidos:', error);
      res.status(500).json({ message: 'Error al obtener archivos compartidos' });
    }
  };
  