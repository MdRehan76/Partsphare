const { Router } = require('express');
const controller = require('./catalog.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = Router();

// ---- Categories (public) ----
router.get('/categories', controller.getCategoryTree);
router.get('/categories/:slug', controller.getCategoryBySlug);

// ---- Categories (admin only) ----
router.post('/categories', authenticate, authorize('ADMIN'), controller.createCategory);
router.patch('/categories/:id', authenticate, authorize('ADMIN'), controller.updateCategory);

// ---- Products (public) ----
router.get('/products', controller.listProducts);
router.get('/products/:slug', controller.getProduct);

// ---- Products (admin only) ----
router.post('/products', authenticate, authorize('ADMIN'), controller.createProduct);
router.patch('/products/:id', authenticate, authorize('ADMIN'), controller.updateProduct);
router.post('/products/:id/compatibility', authenticate, authorize('ADMIN'), controller.addCompatibility);

module.exports = router;
