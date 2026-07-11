/**
 * Post controller - full CRUD for blog posts, with search & pagination.
 */
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const Post = require('../models/Post');
const Category = require('../models/Category');

const PER_PAGE = 8;

/** GET /posts - list, search, paginate */
exports.index = async (req, res, next) => {
  try {
    const search = req.query.q || '';
    const status = req.query.status || '';
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const { data: posts, total } = await Post.getAll({ search, page, perPage: PER_PAGE, status });
    const totalPages = Math.max(Math.ceil(total / PER_PAGE), 1);

    res.render('posts/index', {
      title: 'Posts',
      active: 'posts',
      posts,
      search,
      status,
      pagination: { page, totalPages, total, perPage: PER_PAGE }
    });
  } catch (err) {
    next(err);
  }
};

/** GET /posts/create */
exports.createForm = async (req, res, next) => {
  try {
    const categories = await Category.getAll();
    res.render('posts/create', {
      title: 'Add Post',
      active: 'posts',
      categories,
      errors: null,
      old: {}
    });
  } catch (err) {
    next(err);
  }
};

/** POST /posts */
exports.store = async (req, res, next) => {
  try {
    const { title, slug, category_id, content, status, image_url } = req.body;

    if (!title || !title.trim()) {
      const categories = await Category.getAll();
      return res.render('posts/create', {
        title: 'Add Post',
        active: 'posts',
        categories,
        errors: 'Post title is required.',
        old: req.body
      });
    }

    const finalSlug = slug && slug.trim() ? slugify(slug, { lower: true, strict: true }) : slugify(title, { lower: true, strict: true });

   let featuredImage = image_url ? image_url.trim() : null;

// Upload từ ô Featured Image
if (req.file) {
    featuredImage = "/uploads/" + req.file.filename;
}

// Nếu không có Featured Image thì lấy ảnh đầu tiên trong TinyMCE
if (!featuredImage && content) {
    const match = content.match(/<img[^>]+src="([^"]+)"/);

    if (match) {
        featuredImage = match[1];
    }
}

    await Post.create({
      title: title.trim(),
      slug: finalSlug,
      category_id: category_id || null,
      content: content || '',
      featured_image: featuredImage,
      status: status === 'published' ? 'published' : 'draft'
    });

    res.redirect('/posts');
  } catch (err) {
    next(err);
  }
};

/** GET /posts/:id/edit */
exports.editForm = async (req, res, next) => {
  try {
    const [post, categories] = await Promise.all([
      Post.getById(req.params.id),
      Category.getAll()
    ]);
    res.render('posts/edit', {
      title: 'Edit Post',
      active: 'posts',
      post,
      categories,
      errors: null
    });
  } catch (err) {
    next(err);
  }
};

/** PUT /posts/:id */
exports.update = async (req, res, next) => {
  try {
    const { title, slug, category_id, content, status, image_url, remove_image } = req.body;

    if (!title || !title.trim()) {
      const [post, categories] = await Promise.all([Post.getById(req.params.id), Category.getAll()]);
      return res.render('posts/edit', {
        title: 'Edit Post',
        active: 'posts',
        post: { ...post, ...req.body },
        categories,
        errors: 'Post title is required.'
      });
    }

    const finalSlug = slug && slug.trim() ? slugify(slug, { lower: true, strict: true }) : slugify(title, { lower: true, strict: true });

const existing = await Post.getById(req.params.id);
let featuredImage = existing.featured_image;

if (remove_image === 'on') {
    featuredImage = null;
}

if (image_url && image_url.trim()) {
    featuredImage = image_url.trim();
}

if (req.file) {
    featuredImage = "/uploads/" + req.file.filename;
}

// Nếu vẫn chưa có ảnh đại diện thì lấy ảnh đầu tiên trong TinyMCE
if (!featuredImage && content) {
    const match = content.match(/<img[^>]+src="([^"]+)"/);

    if (match) {
        featuredImage = match[1];
    }
}

    await Post.update(req.params.id, {
      title: title.trim(),
      slug: finalSlug,
      category_id: category_id || null,
      content: content || '',
      featured_image: featuredImage,
      status: status === 'published' ? 'published' : 'draft'
    });

    res.redirect('/posts');
  } catch (err) {
    next(err);
  }
};

/** DELETE /posts/:id */
exports.destroy = async (req, res, next) => {
  try {
    const post = await Post.getById(req.params.id);

    // Remove locally-stored image file, if any
    if (post && post.featured_image && post.featured_image.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', 'public', post.featured_image);
      fs.existsSync(filePath) && fs.unlink(filePath, () => {});
    }

    await Post.delete(req.params.id);
    res.redirect('/posts');
  } catch (err) {
    next(err);
  }
};

exports.uploadImage = async (req,res)=>{

    if(!req.file){
        return res.status(400).json({
            error:"No image"
        });
    }

    res.json({
        location:"/uploads/"+req.file.filename
    });

};
exports.show = async (req, res, next) => {
    try {

        const post = await Post.getById(req.params.id);

        if (!post) {
            return res.status(404).render('404');
        }

        res.render('posts/show', {
            title: post.title,
            active: 'posts',
            post
        });

    } catch (err) {
        next(err);
    }
};