/**
 * Multer configuration for image uploads (Supabase Storage)
 */
const multer = require("multer");

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;

    const extOk = allowed.test(
        file.originalname.split(".").pop().toLowerCase()
    );

    const mimeOk = allowed.test(file.mimetype);

    if (extOk && mimeOk) {
        return cb(null, true);
    }

    cb(new Error("Only jpg, jpeg, png, gif, webp are allowed."));
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

module.exports = upload;