// Local review data only. No production API or authenticated data is used.
const database = () => new Promise((resolve, reject) => {
  const request = indexedDB.open('qollab-publications-web-review', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('review');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
export async function loadReview(key = 'state') {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('review', 'readonly');
    const request = tx.objectStore('review').get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}
export async function saveReview(state, key = 'state') {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('review', 'readwrite');
    tx.objectStore('review').put(state, key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}
