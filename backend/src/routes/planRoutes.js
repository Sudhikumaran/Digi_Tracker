const { Router } = require('express');
const planController = require('../controllers/planController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.get('/plans', planController.listPlans);
router.post('/plans', authenticate, authorize('super_admin'), planController.createPlan);
router.get('/subscriptions', authenticate, authorize('super_admin'), planController.listSubscriptions);
router.put('/subscriptions/:businessId', authenticate, authorize('super_admin'), planController.updateSubscription);

module.exports = router;
