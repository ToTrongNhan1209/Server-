/**
 * Post model - all Supabase queries related to the `posts` table.
 */
const supabase = require('../config/supabase');

const TABLE = 'posts';
const SELECT_WITH_CATEGORY = '*, categories ( id, name, slug )';

const Post = {
  /**
   * Get a paginated, searchable list of posts (newest first).
   * Returns { data, total }.
   */
  async getAll({ search = '', page = 1, perPage = 8, status = '' } = {}) {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from(TABLE)
      .select(SELECT_WITH_CATEGORY, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, total: count || 0 };
  },

  /** Get a single post by id (with its category joined) */
  async getById(id) {
    const { data, error } = await supabase.from(TABLE).select(SELECT_WITH_CATEGORY).eq('id', id).single();
    if (error) throw error;
    return data;
  },

  /** Total count of posts, optionally filtered by status */
  async count(status = '') {
    let query = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (status) query = query.eq('status', status);
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },

  /** Create a new post */
  async create(payload) {
    const { data, error } = await supabase.from(TABLE).insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  /** Update an existing post */
  async update(id, payload) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Delete a post */
  async delete(id) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

module.exports = Post;
