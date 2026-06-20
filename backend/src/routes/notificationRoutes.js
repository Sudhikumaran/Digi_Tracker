const { Router } = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate, tenantScope } = require('../middleware/auth');

const router = Router();

router.use(authenticate, tenantScope);

router.get('/', notificationController.listNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;
