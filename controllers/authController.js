// backend/controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');

// Registro
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Verificar si ya existe el usuario
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const userId = result.insertId;

    // Obtener usuario recién creado
    const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
    const user = rows[0];

    // Guardar usuario en sesión
    req.session.user = user;

    // Enviar al frontend
    res.status(201).json({
      message: 'Usuario registrado correctamente.',
      user
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al registrar usuario.' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email no encontrado.' });
    }

    const user = rows[0];

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    // Guardar usuario en sesión
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    res.json({ message: 'Login exitoso', user: req.session.user });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Sesión cerrada correctamente.' });
  });
};
