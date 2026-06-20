const moduleRepository = require('../repositories/moduleRepository');

const defaultModules = [
  {
    name: 'Instagram',
    slug: 'instagram',
    description: 'Track Instagram growth and engagement metrics',
    icon: 'instagram',
    color: '#E4405F',
    isDefault: true,
    fields: [
      { name: 'Followers', slug: 'followers', type: 'number', required: true, order: 1, isActive: true },
      { name: 'Accounts Reached', slug: 'accounts_reached', type: 'number', required: true, order: 2, isActive: true },
      { name: 'Profile Visits', slug: 'profile_visits', type: 'number', required: false, order: 3, isActive: true },
      { name: 'Story Views', slug: 'story_views', type: 'number', required: false, order: 4, isActive: true },
      { name: 'Reel Views', slug: 'reel_views', type: 'number', required: false, order: 5, isActive: true },
      { name: 'Post Engagement', slug: 'post_engagement', type: 'number', required: false, order: 6, isActive: true },
    ],
  },
  {
    name: 'WhatsApp Community',
    slug: 'whatsapp-community',
    description: 'Track WhatsApp community growth and activity',
    icon: 'whatsapp',
    color: '#25D366',
    isDefault: true,
    fields: [
      { name: 'Community Members', slug: 'community_members', type: 'number', required: true, order: 1, isActive: true },
      { name: 'New Members Joined', slug: 'new_members_joined', type: 'number', required: true, order: 2, isActive: true },
      { name: 'Messages Sent', slug: 'messages_sent', type: 'number', required: false, order: 3, isActive: true },
      { name: 'Active Participants', slug: 'active_participants', type: 'number', required: false, order: 4, isActive: true },
    ],
  },
];

async function seedDefaultModules(businessId, userId) {
  for (const mod of defaultModules) {
    await moduleRepository.create({
      businessId,
      createdBy: userId,
      isActive: true,
      ...mod,
    });
  }
}

module.exports = { defaultModules, seedDefaultModules };
