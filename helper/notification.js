let notificationModel = require("../model/notification.model");

async function notification(userId, message, reason, type, orderId) {
  let notificationObj = {
    userId: userId,
    message: message,
    reason: reason,
    type: type,
    orderId: orderId,
  };
  let newNotificationData = new notificationModel(notificationObj);
  let saveNotification = await newNotificationData.save();
}
module.exports = { notification };
