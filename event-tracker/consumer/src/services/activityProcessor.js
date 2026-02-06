const Activity = require('../models/Activity');
const crypto = require('crypto');

const processActivity = async (data) => {
    try {
        const activity = new Activity({
            id: crypto.randomUUID(),
            userId: data.userId,
            eventType: data.eventType,
            timestamp: new Date(data.timestamp),
            payload: data.payload
        });

        await activity.save();
        console.log(`Processed activity for user: ${data.userId}`);
        return true;
    } catch (error) {
        console.error('Error processing activity:', error);
        throw error;
    }
};

module.exports = {
    processActivity
};
