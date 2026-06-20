const store = require('../db/firestoreStore');
const { COLLECTIONS } = store;

class ModuleRepository {
  async findById(id) {
    return store.findById(COLLECTIONS.modules, id);
  }

  async findByBusiness(businessId, filters = {}) {
    return store.findAll(COLLECTIONS.modules, { businessId: String(businessId), ...filters });
  }

  async findBySlug(businessId, slug) {
    return store.findOne(COLLECTIONS.modules, { businessId: String(businessId), slug });
  }

  async create(data) {
    return store.create(COLLECTIONS.modules, {
      ...data,
      businessId: String(data.businessId),
      createdBy: data.createdBy ? String(data.createdBy) : null,
    });
  }

  async update(id, data) {
    return store.updateById(COLLECTIONS.modules, id, data);
  }

  async countByBusiness(businessId) {
    return store.count(COLLECTIONS.modules, { businessId: String(businessId), isActive: true });
  }
}

module.exports = new ModuleRepository();
