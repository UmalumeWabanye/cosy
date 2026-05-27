const defaultNotificationPreferences = Object.freeze({
  emailApplicationUpdates: true,
  emailAllocationUpdates: true,
  emailMoveInReminders: true,
  emailLandlordAlerts: true,
  emailNewListings: false,
  pushApplicationUpdates: true,
  pushMessages: true,
  pushAllocationUpdates: true,
});

const normalizeNotificationPreferences = (input = {}) => ({
  ...defaultNotificationPreferences,
  ...(input || {}),
});

const canSendEmail = (user, key) => {
  const prefs = normalizeNotificationPreferences(user?.notificationPreferences);
  return Boolean(prefs[key]);
};

const canSendPush = (user, key) => {
  const prefs = normalizeNotificationPreferences(user?.notificationPreferences);
  return Boolean(prefs[key]);
};

module.exports = {
  defaultNotificationPreferences,
  normalizeNotificationPreferences,
  canSendEmail,
  canSendPush,
};
