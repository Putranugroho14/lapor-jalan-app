const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    // Validasi field wajib
    if (!nama || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi!' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ nama, email, password: hashedPassword });
    res.json({ message: 'Registrasi berhasil!' });
  } catch (err) {
    // Handle duplicate email dengan pesan yang user-friendly
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email sudah terdaftar. Gunakan email lain atau silakan login.' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi!' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Password salah' });

    // Token berlaku 7 hari
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login sukses', token, role: user.role, nama: user.nama });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};