const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productosController');

router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getById);
router.post('/',    ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;
