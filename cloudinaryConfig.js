// cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary avec tes informations d'API
cloudinary.config({
  cloud_name: 'mypcapp',  // Remplace par ton Cloud Name
  api_key: '259648772118655',        // Remplace par ta API Key
  api_secret: 'bfTGXjY6hk1pEhlfbve9nvYEb1M'   // Remplace par ton API Secret
});

module.exports = cloudinary;
