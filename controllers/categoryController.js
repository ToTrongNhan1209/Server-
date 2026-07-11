/**
 * Category controller - full CRUD for categories.
 */
const slugify = require('slugify');
const Category = require('../models/Category');

/** GET /categories - list + search */
exports.index = async (req, res, next) => {
  try {
    const search = req.query.q || '';
    const categories = await Category.getAll({ search });

    res.render('categories/index', {
      title: 'Categories',
      active: 'categories',
      categories,
      search
    });
  } catch (err) {
    next(err);
  }
};

/** GET /categories/create */
exports.createForm = (req, res) => {
  res.render('categories/create', {
    title: 'Add Category',
    active: 'categories',
    errors: null,
    old: {}
  });
};

/** POST /categories */
exports.store = async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !name.trim()) {
      return res.render('categories/create', {
        title: 'Add Category',
        active: 'categories',
        errors: 'Category name is required.',
        old: req.body
      });
    }

    const finalSlug = slug && slug.trim() ? slugify(slug, { lower: true, strict: true }) : slugify(name, { lower: true, strict: true });

    await Category.create({
      name: name.trim(),
      slug: finalSlug,
      description: description ? description.trim() : null
    });

    req.flash && req.flash('success', 'Category created successfully.');
    res.redirect('/categories');
  } catch (err) {
    next(err);
  }
};

/** GET /categories/:id/edit */
exports.editForm = async (req, res, next) => {
  try {
    const category = await Category.getById(req.params.id);
    res.render('categories/edit', {
      title: 'Edit Category',
      active: 'categories',
      category,
      errors: null
    });
  } catch (err) {
    next(err);
  }
};

/** PUT /categories/:id */
exports.update = async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !name.trim()) {
      const category = await Category.getById(req.params.id);
      return res.render('categories/edit', {
        title: 'Edit Category',
        active: 'categories',
        category: { ...category, ...req.body },
        errors: 'Category name is required.'
      });
    }

    const finalSlug = slug && slug.trim() ? slugify(slug, { lower: true, strict: true }) : slugify(name, { lower: true, strict: true });

    await Category.update(req.params.id, {
      name: name.trim(),
      slug: finalSlug,
      description: description ? description.trim() : null
    });

    res.redirect('/categories');
  } catch (err) {
    next(err);
  }
};

/** DELETE /categories/:id */
exports.destroy = async (req, res, next) => {
  try {
    await Category.delete(req.params.id);
    res.redirect('/categories');
  } catch (err) {
    next(err);
  }
};
