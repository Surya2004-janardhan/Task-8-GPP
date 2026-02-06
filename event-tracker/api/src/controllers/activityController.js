const Joi = require('joi');
const { publishToQueue } = require('../services/queueService');

const activitySchema = Joi.object({
    userId: Joi.string().guid().required(),
    eventType: Joi.string().min(1).required(),
    timestamp: Joi.string().isoDate().required(),
    payload: Joi.object().required()
});

const ingestActivity = async (req, res) => {
    try {
        const { error, value } = activitySchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                error: 'Bad Request',
                message: error.details[0].message,
                details: error.details
            });
        }

        // Publish to RabbitMQ
        await publishToQueue(value);

        return res.status(202).json({
            message: 'Event successfully received and queued'
        });
    } catch (error) {
        console.error('Controller Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while processing your request'
        });
    }
};

module.exports = {
    ingestActivity
};
