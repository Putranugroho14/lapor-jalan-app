const { Report, User } = require('../models');

exports.createReport = async (req, res) => {
  try {
    // Debug logs to trace incoming data
    console.log('createReport - req.body:', req.body);
    console.log('createReport - req.file:', req.file);
    console.log('createReport - req.user:', req.user);
    const { title, description, latitude, longitude, damageType, damageSeverity, trafficImpact, impactedVehicles } = req.body;
    let photo = null;
    if (req.file) {
      // Support both Cloudinary (path URL) and local storage (filename)
      photo = req.file.path && req.file.path.startsWith('http') ? req.file.path : req.file.filename;
    }

    if (!photo || !latitude) return res.status(400).json({ message: "Foto dan Lokasi wajib ada!" });

    // Parse impactedVehicles if it comes as stringified JSON from FormData (which sends text)
    let parsedVehicles = impactedVehicles;
    try {
      if (typeof impactedVehicles === 'string') {
        parsedVehicles = JSON.parse(impactedVehicles);
      }
    } catch (e) {
      // failed to parse, keep as is or set null
      console.error("Failed to parse impactedVehicles", e);
    }

    await Report.create({
      userId: req.user.id,
      title,
      description,
      photo,
      latitude,
      longitude,
      damageType,
      damageSeverity,
      trafficImpact,
      impactedVehicles: parsedVehicles
    });

    res.status(201).json({ message: "Laporan berhasil dikirim!" });
  } catch (err) {
    console.error('createReport ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [{ model: User, as: 'pelapor', attributes: ['nama'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ data: reports });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Update Status & Priority (Admin Only)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    console.log('Update Request:', { id, status, priority });

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ message: "Laporan tidak ditemukan!" });
    }

    if (status) {
      if (!['Pending', 'Proses', 'Selesai'].includes(status)) {
        return res.status(400).json({ message: "Status tidak valid!" });
      }
      report.status = status;
    }

    if (priority) {
      if (!['Rendah', 'Sedang', 'Tinggi', 'Darurat'].includes(priority)) {
        return res.status(400).json({ message: "Prioritas tidak valid!" });
      }
      report.priority = priority;
    }

    console.log('Saving Report:', report.dataValues);
    await report.save();

    res.json({ message: "Data berhasil diperbarui!", data: report });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete Report (Admin Only)
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Delete Report Request:', { id }); // Debug log

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ message: "Laporan tidak ditemukan!" });
    }

    // Delete the report
    await report.destroy();

    res.json({ message: "Laporan berhasil dihapus!" });
  } catch (err) {
    console.error('Delete Report Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get Public Stats
exports.getStats = async (req, res) => {
  try {
    const userCount = await User.count();
    const resolvedReportsCount = await Report.count({
      where: { status: 'Selesai' }
    });

    res.json({
      userCount,
      resolvedReportsCount,
      regionCount: 1 // Hardcoded as requested
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};