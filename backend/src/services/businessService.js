const businessRepository = require('../repositories/businessRepository');
const AppError = require('../utils/AppError');

class BusinessService {
  async getProfile(businessId) {
    const business = await businessRepository.findById(businessId);
    if (!business) throw new AppError('Business not found', 404);
    return business;
  }

  async updateProfile(businessId, data) {
    return businessRepository.update(businessId, data);
  }

  async listAll(query = {}) {
    const { page = 1, limit = 20, search } = query;
    const filters = {};
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    return businessRepository.findAll(filters, parseInt(page), parseInt(limit));
  }

  async getById(id) {
    const business = await businessRepository.findById(id);
    if (!business) throw new AppError('Business not found', 404);
    return business;
  }
}

module.exports = new BusinessService();
