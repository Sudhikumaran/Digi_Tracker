const { Router } = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize, tenantScope } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.put('/me', validate(schemas.updateUser), userController.updateMe);
router.put('/me/fcm-token', validate(schemas.registerFcmToken), userController.registerFcmToken);

router.get('/', authorize('business_owner', 'super_admin'), tenantScope, userController.listUsers);
router.post('/', authorize('business_owner'), tenantScope, validate(schemas.createStaff), userController.createUser);
router.put('/:id', authorize('business_owner'), tenantScope, validate(schemas.updateUser), userController.updateUser);
router.delete('/:id', authorize('business_owner'), tenantScope, userController.deleteUser);

module.exports = router;
