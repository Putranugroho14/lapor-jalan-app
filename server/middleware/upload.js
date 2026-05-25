const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

let storage;

// Configure Cloudinary if credentials are present
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'lapor-jalan',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    },
  });
  console.log('✅ Using Cloudinary for file storage');
} else {
  // Fallback to local disk storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
      cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
  });
  console.log('⚠️ using Local Disk for file storage (Files will not persist on Vercel)');
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;