/**
 * Blog CMS Admin - Application entry point.
 * Node.js + Express + EJS + Supabase
 */
require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const dashboardRoutes = require('./routes/dashboardRoutes');
const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------
// View engine
// -----------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);

// -----------------------
// Middleware
// -----------------------
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// -----------------------
// Routes
// -----------------------
app.use('/', dashboardRoutes);
app.use('/posts', postRoutes);
app.use('/categories', categoryRoutes);

// -----------------------
// 404 handler
// -----------------------
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Not Found',
    active: '',
    layout: 'layouts/main'
  });
});

// -----------------------
// Error handler
// -----------------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(`
    <div style="font-family:sans-serif;padding:2rem;">
      <h2>Something went wrong</h2>
      <pre>${err.message}</pre>
    </div>
  `);
});

app.listen(PORT, () => {
  console.log(`Blog CMS Admin running at http://localhost:${PORT}`);
});
