const store = require('../db/firestoreStore');
const { COLLECTIONS } = store;
const { hashPassword, attachUserMethods } = require('../db/userHelpers');

class UserRepository {
  async findByEmail(email) {
    const user = await store.findOne(COLLECTIONS.users, { email: email.toLowerCase().trim() });
    return attachUserMethods(user);
  }

  async findById(id) {
    const user = await store.findById(COLLECTIONS.users, id);
    return attachUserMethods(user);
  }

  async create(data) {
    const payload = { ...data, email: data.email.toLowerCase().trim(), isActive: data.isActive !== false };
    if (payload.password) payload.password = await hashPassword(payload.password);
    const user = await store.create(COLLECTIONS.users, payload);
    return attachUserMethods(user);
  }

  async update(id, data) {
    const payload = { ...data };
    if (payload.password) payload.password = await hashPassword(payload.password);
    const user = await store.updateById(COLLECTIONS.users, id, payload);
    return attachUserMethods(user);
  }

  async updatePassword(id, password) {
    return this.update(id, {
      password,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }

  async findByBusiness(businessId, filters = {}, page = 1, limit = 20) {
    const merged = { businessId: String(businessId), ...filters };
    const result = await store.find(COLLECTIONS.users, merged, page, limit);
    const users = result.docs.map(({ password, passwordResetToken, passwordResetExpires, ...safe }) => safe);
    return { users, total: result.total, page: result.page, limit: result.limit, pages: result.pages };
  }

  async findByIds(ids) {
    const users = await Promise.all(ids.map((id) => store.findById(COLLECTIONS.users, id)));
    return users.filter(Boolean);
  }

  async saveRefreshToken(userId, token, expiresAt) {
    return store.create(COLLECTIONS.refreshTokens, { userId: String(userId), token, expiresAt });
  }

  async findRefreshToken(token) {
    return store.findOne(COLLECTIONS.refreshTokens, { token });
  }

  async deleteRefreshToken(token) {
    const row = await store.findOne(COLLECTIONS.refreshTokens, { token });
    if (row) await store.deleteById(COLLECTIONS.refreshTokens, row._id);
  }

  async deleteAllRefreshTokens(userId) {
    await store.deleteMany(COLLECTIONS.refreshTokens, { userId: String(userId) });
  }

  async findByResetToken(token) {
    const users = await store.findAll(COLLECTIONS.users, {
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });
    return attachUserMethods(users[0] || null);
  }
}

module.exports = new UserRepository();
