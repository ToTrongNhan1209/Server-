const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.index);
router.get('/create', categoryController.createForm);
router.post('/', categoryController.store);
router.get('/:id/edit', categoryController.editForm);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.destroy);

module.exports = router;
