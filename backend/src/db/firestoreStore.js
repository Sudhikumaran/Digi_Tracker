const { Timestamp } = require('firebase-admin/firestore');
const { getFirestore } = require('firebase-admin/firestore');
const { initFirebase, getFirebaseAdmin } = require('../config/firebase');

const COLLECTIONS = {
  users: 'users',
  businesses: 'businesses',
  modules: 'modules',
  entries: 'entries',
  auditLogs: 'auditLogs',
  rewards: 'rewards',
  notifications: 'notifications',
  reports: 'reports',
  plans: 'plans',
  subscriptions: 'subscriptions',
  refreshTokens: 'refreshTokens',
};

function getDb() {
  initFirebase();
  const admin = getFirebaseAdmin();
  if (!admin) throw new Error('Firebase not initialized — check credentials/firebase-service-account.json');
  return getFirestore();
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value.toDate) return value.toDate();
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  return value;
}

function serialize(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (value instanceof Date) return Timestamp.fromDate(value);
  if (Array.isArray(value)) return value.map(serialize);
  if (typeof value === 'object' && value.constructor === Object) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const s = serialize(v);
      if (s !== undefined) out[k] = s;
    }
    return out;
  }
  return value;
}

function deserialize(data) {
  if (!data) return data;
  const out = { ...data };
  for (const key of ['createdAt', 'updatedAt', 'entryDate', 'lastEntryDate', 'trialEndsAt', 'startDate', 'endDate', 'expiresAt', 'passwordResetExpires']) {
    if (out[key]) out[key] = toDate(out[key]);
  }
  if (out.period && typeof out.period === 'object') {
    out.period = {
      start: toDate(out.period.start),
      end: toDate(out.period.end),
    };
  }
  return out;
}

function fromDoc(doc) {
  if (!doc || !doc.exists) return null;
  const data = deserialize(doc.data());
  return { _id: doc.id, ...data };
}

function fromDocs(snapshot) {
  return snapshot.docs.map((d) => fromDoc(d));
}

function matchesFilter(doc, filters) {
  for (const [key, val] of Object.entries(filters)) {
    if (key === '$or') {
      const ok = val.some((clause) => matchesFilter(doc, clause));
      if (!ok) return false;
      continue;
    }
    const field = doc[key];
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      if (val.$gte !== undefined && !(toDate(field) >= toDate(val.$gte))) return false;
      if (val.$lte !== undefined && !(toDate(field) <= toDate(val.$lte))) return false;
      if (val.$gt !== undefined && !(toDate(field) > toDate(val.$gt))) return false;
      if (val.$in !== undefined && !val.$in.map(String).includes(String(field))) return false;
      if (val.$regex !== undefined) {
        const re = new RegExp(val.$regex, val.$options || '');
        if (!re.test(String(field || ''))) return false;
      }
      continue;
    }
    if (String(field) !== String(val)) return false;
  }
  return true;
}

function sortDocs(docs, field = 'createdAt', dir = 'desc') {
  return docs.sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    const aTime = av instanceof Date ? av.getTime() : av;
    const bTime = bv instanceof Date ? bv.getTime() : bv;
    if (aTime < bTime) return dir === 'asc' ? -1 : 1;
    if (aTime > bTime) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

async function create(collection, data) {
  const db = getDb();
  const ref = db.collection(collection).doc();
  const now = new Date();
  const payload = serialize({ ...data, _id: ref.id, createdAt: now, updatedAt: now });
  await ref.set(payload);
  return fromDoc(await ref.get());
}

async function findById(collection, id) {
  if (!id) return null;
  const doc = await getDb().collection(collection).doc(String(id)).get();
  return fromDoc(doc);
}

async function findOne(collection, filters = {}) {
  const docs = await findAll(collection, filters);
  return docs[0] || null;
}

async function findAll(collection, filters = {}, { sortField = 'createdAt', sortDir = 'desc' } = {}) {
  const db = getDb();
  let query = db.collection(collection);

  const simpleFilters = {};
  for (const [key, val] of Object.entries(filters)) {
    if (key.startsWith('$')) continue;
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) continue;
    simpleFilters[key] = val;
  }

  for (const [key, val] of Object.entries(simpleFilters)) {
    query = query.where(key, '==', val);
  }

  const snapshot = await query.get();
  let docs = fromDocs(snapshot).filter((d) => matchesFilter(d, filters));
  docs = sortDocs(docs, sortField, sortDir);
  return docs;
}

async function find(collection, filters = {}, page = 1, limit = 20, sortField = 'createdAt', sortDir = 'desc') {
  const all = await findAll(collection, filters, { sortField, sortDir });
  const total = all.length;
  const skip = (page - 1) * limit;
  return {
    docs: all.slice(skip, skip + limit),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
}

async function count(collection, filters = {}) {
  const all = await findAll(collection, filters);
  return all.length;
}

async function updateById(collection, id, data) {
  const db = getDb();
  const ref = db.collection(collection).doc(String(id));
  const payload = serialize({ ...data, updatedAt: new Date() });
  delete payload._id;
  await ref.update(payload);
  return findById(collection, id);
}

async function setById(collection, id, data) {
  const db = getDb();
  const ref = db.collection(collection).doc(String(id));
  const now = new Date();
  const payload = serialize({ ...data, _id: id, updatedAt: now });
  if (!data.createdAt) payload.createdAt = now;
  await ref.set(payload, { merge: true });
  return findById(collection, id);
}

async function deleteById(collection, id) {
  await getDb().collection(collection).doc(String(id)).delete();
}

async function deleteMany(collection, filters = {}) {
  const docs = await findAll(collection, filters);
  const db = getDb();
  const batch = db.batch();
  docs.forEach((d) => batch.delete(db.collection(collection).doc(d._id)));
  if (docs.length) await batch.commit();
  return docs.length;
}

async function clearCollection(collection) {
  const db = getDb();
  const snapshot = await db.collection(collection).get();
  if (snapshot.empty) return 0;
  const batch = db.batch();
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snapshot.size;
}

module.exports = {
  COLLECTIONS,
  getDb,
  create,
  findById,
  findOne,
  findAll,
  find,
  count,
  updateById,
  setById,
  deleteById,
  deleteMany,
  clearCollection,
  toDate,
};
