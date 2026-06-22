require('dotenv').config();
const crypto = require('crypto');
const connectDB = require('../config/database');
const store = require('../db/firestoreStore');
const { COLLECTIONS } = store;
const userRepository = require('../repositories/userRepository');
const businessRepository = require('../repositories/businessRepository');
const { planRepository, subscriptionRepository } = require('../repositories/firebaseRepositories');

const isProduction = process.env.NODE_ENV === 'production';

const plans = [
  {
    name: 'Starter',
    slug: 'starter',
    price: 29,
    limits: { maxStaff: 3, maxModules: 5, maxEntriesPerMonth: 500 },
    features: {
      maxStaff: 3, maxModules: 5, maxBranches: 1,
      analytics: true, reports: false, customModules: false,
      rewards: true, whiteLabel: false, apiAccess: false,
    },
  },
  {
    name: 'Professional',
    slug: 'professional',
    price: 79,
    limits: { maxStaff: 15, maxModules: 20, maxEntriesPerMonth: 5000 },
    features: {
      maxStaff: 15, maxModules: 20, maxBranches: 3,
      analytics: true, reports: true, customModules: true,
      rewards: true, whiteLabel: false, apiAccess: false,
    },
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    price: 199,
    limits: { maxStaff: 100, maxModules: 999, maxEntriesPerMonth: 999999 },
    features: {
      maxStaff: 100, maxModules: 999, maxBranches: 50,
      analytics: true, reports: true, customModules: true,
      rewards: true, whiteLabel: true, apiAccess: true, prioritySupport: true,
    },
  },
];

const accounts = {
  superAdmin: {
    email: process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@digitracker.com',
    password: process.env.SEED_SUPERADMIN_PASSWORD,
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
  },
  admin: {
    email: process.env.SEED_ADMIN_EMAIL || 'admin@digitracker.com',
    password: process.env.SEED_ADMIN_PASSWORD,
    firstName: 'Business',
    lastName: 'Admin',
    role: 'business_owner',
  },
  staff: {
    email: process.env.SEED_STAFF_EMAIL || 'staff@digitracker.com',
    password: process.env.SEED_STAFF_PASSWORD,
    firstName: 'Staff',
    lastName: 'Member',
    role: 'staff',
  },
};

function resolvePassword(envPassword, label) {
  if (envPassword) return envPassword;
  if (isProduction) {
    throw new Error(
      `Missing ${label} in production. Set it in Railway/backend variables before running seed.`
    );
  }
  return crypto.randomBytes(16).toString('base64url');
}

async function clearAll() {
  for (const col of Object.values(COLLECTIONS)) {
    await store.clearCollection(col);
  }
}

async function seed() {
  await connectDB();
  console.log(`Seeding Firestore (${isProduction ? 'production' : 'development'})...`);
  console.log('Clearing existing data...');

  await clearAll();

  for (const plan of plans) {
    await planRepository.create(plan);
  }
  console.log('Subscription plans created');

  const superAdminPassword = resolvePassword(accounts.superAdmin.password, 'SEED_SUPERADMIN_PASSWORD');
  const adminPassword = resolvePassword(accounts.admin.password, 'SEED_ADMIN_PASSWORD');
  const staffPassword = resolvePassword(accounts.staff.password, 'SEED_STAFF_PASSWORD');

  await userRepository.create({
    email: accounts.superAdmin.email,
    password: superAdminPassword,
    firstName: accounts.superAdmin.firstName,
    lastName: accounts.superAdmin.lastName,
    role: accounts.superAdmin.role,
  });
  console.log('Super Admin created:', accounts.superAdmin.email);

  const business = await businessRepository.create({
    name: 'DigiTracker Organization',
    slug: 'digitracker-organization',
    type: 'business',
    email: accounts.admin.email,
    contactNumber: '',
    timezone: 'UTC',
    onboardingCompleted: true,
  });

  const admin = await userRepository.create({
    email: accounts.admin.email,
    password: adminPassword,
    firstName: accounts.admin.firstName,
    lastName: accounts.admin.lastName,
    role: accounts.admin.role,
    businessId: business._id,
  });

  await userRepository.create({
    email: accounts.staff.email,
    password: staffPassword,
    firstName: accounts.staff.firstName,
    lastName: accounts.staff.lastName,
    role: accounts.staff.role,
    businessId: business._id,
  });

  const proPlan = await planRepository.findBySlug('professional');
  await subscriptionRepository.create({
    businessId: business._id,
    planId: proPlan._id,
    status: 'active',
    startDate: new Date(),
  });

  console.log('Business shell created for admin/staff (no modules or entries)');
  console.log('\n--- Production seed complete ---');
  console.log('Super Admin:', accounts.superAdmin.email);
  console.log('Admin:      ', accounts.admin.email);
  console.log('Staff:      ', accounts.staff.email);
  if (!isProduction) {
    console.log('\nDevelopment-only passwords (save these):');
    console.log('Super Admin password:', superAdminPassword);
    console.log('Admin password:      ', adminPassword);
    console.log('Staff password:      ', staffPassword);
  } else {
    console.log('\nPasswords were taken from SEED_*_PASSWORD environment variables.');
    console.log('Change them after first login via Settings or user management.');
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message || err);
  process.exit(1);
});
