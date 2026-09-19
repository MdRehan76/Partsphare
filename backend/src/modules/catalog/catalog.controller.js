const categoriesService = require('./categories.service');
const productsService = require('./products.service');
const { sendSuccess, sendCreated } = require('../../utils/response');

// ---- Categories ----
const getCategoryTree = async (req, res, next) => {
  try {
    const tree = await categoriesService.getCategoryTree();
    return sendSuccess(res, { data: tree });
  } catch (err) { next(err); }
};

const getCategoryBySlug = async (req, res, next) => {
  try {
    const cat = await categoriesService.getCategoryBySlug(req.params.slug);
    return sendSuccess(res, { data: cat });
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const cat = await categoriesService.createCategory(req.body);
    return sendCreated(res, { message: 'Category created.', data: cat });
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const cat = await categoriesService.updateCategory(req.params.id, req.body);
    return sendSuccess(res, { message: 'Category updated.', data: cat });
  } catch (err) { next(err); }
};

// ---- Products ----
const listProducts = async (req, res, next) => {
  try {
    const result = await productsService.listProducts(req.query);
    return sendSuccess(res, { data: result.products, meta: result.meta });
  } catch (err) { next(err); }
};

const getProduct = async (req, res, next) => {
  try {
    const { variantId } = req.query;
    const product = await productsService.getProductBySlug(req.params.slug, variantId);
    return sendSuccess(res, { data: product });
  } catch (err) { next(err); }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productsService.createProduct(req.body);
    return sendCreated(res, { message: 'Product created.', data: product });
  } catch (err) { next(err); }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productsService.updateProduct(req.params.id, req.body);
    return sendSuccess(res, { message: 'Product updated.', data: product });
  } catch (err) { next(err); }
};

const addCompatibility = async (req, res, next) => {
  try {
    const { variantIds } = req.body;
    const compat = await productsService.addCompatibility(req.params.id, variantIds);
    return sendSuccess(res, { message: 'Compatibility updated.', data: compat });
  } catch (err) { next(err); }
};

module.exports = {
  getCategoryTree, getCategoryBySlug, createCategory, updateCategory,
  listProducts, getProduct, createProduct, updateProduct, addCompatibility,
};
