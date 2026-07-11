/**
 * Category model - all Supabase queries related to the `categories` table.
 */
const supabase = require('../config/supabase');

const TABLE = 'categories';

const Category = {
  /**
   * Get all categories, optionally filtered by a search term (name or slug).
   */
  async getAll({ search = '' } = {}) {
    let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /** Get a single category by id */
  async getById(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  /** Total count of categories */
  async count() {
    const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  },

  /** Create a new category */
  async create(payload) {
    const { data, error } = await supabase.from(TABLE).insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  /** Update an existing category */
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

  /** Delete a category */
  async delete(id) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

module.exports = Category;
