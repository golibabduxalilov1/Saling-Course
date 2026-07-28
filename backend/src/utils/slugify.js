function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[ʻʼʼ'`’]/g, '')
    .replace(/[^a-z0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

module.exports = { slugify };
