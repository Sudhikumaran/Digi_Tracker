const { Router } = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, authorize, tenantScope } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

const router = Router();

router.use(authenticate, tenantScope, authorize('business_owner'));

router.post('/generate', validate(schemas.generateReport), reportController.generateReport);
router.get('/', reportController.listReports);
router.get('/:id/download', reportController.downloadReport);

module.exports = router;
