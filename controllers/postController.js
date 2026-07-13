/**
 * Post controller - full CRUD for blog posts, with search & pagination.
 */
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const Post = require('../models/Post');
const Category = require('../models/Category');
const supabase = require("../config/supabase");
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

if (req.file) {

    const ext = req.file.originalname.split(".").pop();

    const fileName =
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2) +
        "." +
        ext;

    const { error } = await supabase.storage
        .from("images")
        .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype
        });

    if (error) throw error;

    const { data } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

    featuredImage = data.publicUrl;
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

    const ext = req.file.originalname.split(".").pop();

    const fileName =
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2) +
        "." +
        ext;

    const { error } = await supabase.storage
        .from("images")
        .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype
        });

    if (error) throw error;

    const { data } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

    featuredImage = data.publicUrl;
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
    console.log("Body:", req.body);
console.log("Status:", status);
  } catch (err) {
    next(err);
  }
};

/** DELETE /posts/:id */
exports.destroy = async (req, res, next) => {
  try {
    const post = await Post.getById(req.params.id);

    if (post?.featured_image) {

      // Lấy tên file từ URL
      const fileName = post.featured_image.split("/").pop();

      await supabase.storage
        .from("images")
        .remove([fileName]);
    }

    await Post.delete(req.params.id);

    res.redirect("/posts");

  } catch (err) {
    next(err);
  }
};

exports.uploadImage = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                error: "No image uploaded"
            });
        }

        const ext = req.file.originalname.split(".").pop();

        const fileName =
            Date.now() +
            "-" +
            Math.random().toString(36).substring(2) +
            "." +
            ext;

        const { error } = await supabase.storage
            .from("images")
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (error) throw error;

        const { data } = supabase.storage
            .from("images")
            .getPublicUrl(fileName);

        res.json({
            location: data.publicUrl
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: err.message
        });

    }

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