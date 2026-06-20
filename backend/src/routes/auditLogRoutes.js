const { Router } = require('express');
const auditLogController = require('../controllers/auditLogController');
const { authenticate, authorize, tenantScope } = require('../middleware/auth');

const router = Router();

router.use(authenticate, tenantScope, authorize('business_owner', 'super_admin'));

router.get('/', auditLogController.listAuditLogs);

module.exports = router;
