const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp();

const MAX_NEWSLETTERS = 3;

/**
 * When a new newsletter is created, delete any older ones so only the 3 most
 * recent remain in Firestore.
 */
exports.trimNewsletters = onDocumentCreated('newsletters/{newsletterId}', async (event) => {
  const db = getFirestore();
  const snapshot = await db
    .collection('newsletters')
    .orderBy('createdAt', 'desc')
    .get();

  if (snapshot.size <= MAX_NEWSLETTERS) {
    return null;
  }

  const toDelete = snapshot.docs.slice(MAX_NEWSLETTERS);
  const batch = db.batch();

  toDelete.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Removed ${toDelete.length} old newsletter(s). Keeping ${MAX_NEWSLETTERS} most recent.`);
  return null;
});
