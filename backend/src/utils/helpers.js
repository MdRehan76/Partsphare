/**
 * Generate a unique order number in format PS-YYYYMM-XXXXXX
 */
const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PS-${year}${month}-${random}`;
};

/**
 * Generate a URL-friendly slug from a string
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Paginate a Prisma query
 * @param {number} page - 1-indexed
 * @param {number} limit
 * @returns {{ skip, take, page, limit }}
 */
const paginate = (page = 1, limit = 20) => {
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.min(100, Math.max(1, parseInt(limit, 10)));
  return { skip: (p - 1) * l, take: l, page: p, limit: l };
};

/**
 * Build pagination meta object for responses
 */
const paginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

module.exports = { generateOrderNumber, slugify, paginate, paginationMeta };
