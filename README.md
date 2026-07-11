# Blog CMS Admin

A simple, clean Blog CMS Admin Dashboard built with **Node.js**, **Express.js**, **EJS**, **Sass (SCSS)**, and **Supabase**.

## Features

- 📊 **Dashboard** — total posts, total categories, published/draft counts, recent posts
- 📝 **Post management** — full CRUD, search, pagination, image upload (local file or URL), auto slug generation
- 🗂 **Category management** — full CRUD, search, auto slug generation
- 🌓 **Light / dark mode** toggle (persisted in `localStorage`)
- 📱 Responsive admin layout with collapsible sidebar on mobile
- 🧱 MVC architecture with reusable EJS partials (sidebar, header, footer, pagination, forms)

## Tech Stack

| Layer      | Tech                                   |
|------------|-----------------------------------------|
| Server     | Node.js + Express.js                    |
| Views      | EJS + `express-ejs-layouts`             |
| Styling    | Sass (SCSS) → compiled CSS              |
| Database   | Supabase (PostgreSQL) via `@supabase/supabase-js` |
| Uploads    | Multer (local disk storage)             |

## Folder Structure

```text
project/
├── app.js                  # App entry point
├── config/
│   ├── supabase.js         # Supabase client
│   ├── multer.js           # File upload config
│   └── db.sql              # Database schema (run in Supabase SQL editor)
├── controllers/
│   ├── dashboardController.js
│   ├── postController.js
│   └── categoryController.js
├── models/
│   ├── Post.js              # Post data-access layer (Supabase queries)
│   └── Category.js          # Category data-access layer
├── routes/
│   ├── dashboardRoutes.js
│   ├── postRoutes.js
│   └── categoryRoutes.js
├── views/
│   ├── layouts/main.ejs     # Shared layout
│   ├── partials/            # sidebar, header, footer, pagination
│   ├── dashboard/index.ejs
│   ├── posts/                # index, create, edit, _form (reusable)
│   └── categories/           # index, create, edit, _form (reusable)
├── public/
│   ├── scss/                 # SCSS source (variables, base, layout, components)
│   ├── css/main.css          # Compiled CSS (already built — no build step required)
│   ├── js/main.js            # Client-side interactions
│   └── uploads/               # Uploaded featured images
└── package.json
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your Supabase dashboard and run the contents of `config/db.sql`. This creates the `posts` and `categories` tables (with a small seed of sample categories).
3. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```
PORT=3000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-or-service-role-key
```

> For local development, the **anon** key works fine as long as Row Level Security (RLS) is disabled on the `posts`/`categories` tables, or you've added policies that allow the operations used here. For a production deployment behind proper auth, use a **service role** key on the server only, never exposed to the browser.

### 3. Run the app

```bash
npm start
```

Or with auto-reload during development:

```bash
npm run dev
```

Visit **http://localhost:3000**.

### 4. (Optional) Rebuild CSS after editing SCSS

The compiled `public/css/main.css` is already included and works out of the box. If you edit files in `public/scss/`, rebuild with:

```bash
npm run build:css
```

## Notes

- **Featured images** can either be uploaded (stored in `public/uploads/`, path saved to DB) or provided as an external image URL.
- **Slugs** are auto-generated from the title/name if left blank, and are always sanitized with `slugify`.
- **Search** on posts filters by title; category search filters by name/slug.
- **Pagination** on posts defaults to 8 per page (configurable in `controllers/postController.js`).
- Dark mode preference is stored in the browser's `localStorage` and applied before first paint to avoid a flash of the wrong theme.
