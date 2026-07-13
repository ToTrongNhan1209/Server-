const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const upload = require('../config/multer');

router.get('/', postController.index);

router.get('/create', postController.createForm);
router.post('/', upload.single('featured_image'), postController.store);

router.get('/:id', postController.show);

router.get('/:id/edit', postController.editForm);

// UPDATE
router.post('/:id', upload.single('featured_image'), postController.update);

// DELETE
router.delete('/:id', postController.destroy);

router.post(
    '/upload-image',
    upload.single('image'),
    postController.uploadImage
);

module.exports = router;    