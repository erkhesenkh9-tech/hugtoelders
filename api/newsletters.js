/** Public newsletter list for the website — reads from Firestore server-side. */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    return res.status(500).json({ error: 'Firebase is not configured on the server' });
  }

  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 50));
  const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);

  try {
    const url =
      `https://firestore.googleapis.com/v1/projects/${projectId}` +
      `/databases/(default)/documents/newsletters?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Could not read newsletters from Firestore');
    }

    const items = (data.documents || []).map(parseFirestoreDoc).sort(sortByCreatedAtDesc);
    const slice = items.slice(skip, skip + limit);

    return res.status(200).json({ items: slice, total: items.length });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to load newsletters' });
  }
};

function parseFirestoreDoc(doc) {
  const id = doc.name.split('/').pop();
  const fields = doc.fields || {};

  return {
    id,
    title: readField(fields.title),
    dateLabel: readField(fields.dateLabel),
    excerpt: readField(fields.excerpt),
    link: readField(fields.link),
    createdAt: readField(fields.createdAt)
  };
}

function readField(field) {
  if (!field) return '';
  if (field.stringValue !== undefined) return field.stringValue;
  if (field.timestampValue !== undefined) return field.timestampValue;
  if (field.integerValue !== undefined) return Number(field.integerValue);
  return '';
}

function sortByCreatedAtDesc(a, b) {
  const aTime = Date.parse(a.createdAt) || 0;
  const bTime = Date.parse(b.createdAt) || 0;
  return bTime - aTime;
}
