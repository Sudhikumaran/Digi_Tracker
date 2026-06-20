const { getMessaging } = require('../config/firebase');
const userRepository = require('../repositories/userRepository');

class FcmService {
  _stringifyData(data = {}) {
    const out = {};
    for (const [key, value] of Object.entries(data)) {
      out[key] = value == null ? '' : String(value);
    }
    return out;
  }

  async sendToUser(userId, { title, body, data = {} }) {
    const messaging = getMessaging();
    if (!messaging) return { sent: false, reason: 'firebase_not_configured' };

    const user = await userRepository.findById(userId);
    if (!user?.fcmToken) return { sent: false, reason: 'no_fcm_token' };

    try {
      const messageId = await messaging.send({
        token: user.fcmToken,
        notification: { title, body },
        data: this._stringifyData(data),
        webpush: {
          notification: { title, body },
        },
      });
      return { sent: true, messageId };
    } catch (err) {
      if (err.code === 'messaging/registration-token-not-registered') {
        await userRepository.update(userId, { fcmToken: null });
      }
      console.warn('[FCM] Send failed:', err.message);
      return { sent: false, reason: err.message };
    }
  }

  async sendToUsers(userIds, payload) {
    const results = await Promise.allSettled(
      userIds.map((id) => this.sendToUser(id, payload))
    );
    const sent = results.filter((r) => r.status === 'fulfilled' && r.value.sent).length;
    return { sent, total: userIds.length };
  }
}

module.exports = new FcmService();
