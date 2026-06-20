const { Router } = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const businessRoutes = require('./businessRoutes');
const moduleRoutes = require('./moduleRoutes');
const entryRoutes = require('./entryRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const rewardRoutes = require('./rewardRoutes');
const reportRoutes = require('./reportRoutes');
const notificationRoutes = require('./notificationRoutes');
const auditLogRoutes = require('./auditLogRoutes');
const planRoutes = require('./planRoutes');

const router = Router();

router.get('/health', async (req, res) => {
  let firestore = 'disconnected';
  try {
    const { getDb } = require('../db/firestoreStore');
    await getDb().collection('_health').doc('ping').get();
    firestore = 'connected';
  } catch {
    firestore = 'disconnected';
  }
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'firestore',
    firestore,
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/businesses', businessRoutes);
router.use('/modules', moduleRoutes);
router.use('/entries', entryRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/rewards', rewardRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/', planRoutes);

module.exports = router;
