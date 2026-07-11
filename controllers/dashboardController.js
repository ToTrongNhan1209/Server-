/**
 * Dashboard controller - shows aggregate statistics.
 */
const Post = require('../models/Post');
const Category = require('../models/Category');

exports.index = async (req, res, next) => {
  try {
    const [totalPosts, totalCategories, publishedPosts, draftPosts, recent] = await Promise.all([
      Post.count(),
      Category.count(),
      Post.count('published'),
      Post.count('draft'),
      Post.getAll({ page: 1, perPage: 5 })
    ]);

    res.render('dashboard/index', {
      title: 'Dashboard',
      active: 'dashboard',
      stats: { totalPosts, totalCategories, publishedPosts, draftPosts },
      recentPosts: recent.data
    });
  } catch (err) {
    next(err);
  }
};
