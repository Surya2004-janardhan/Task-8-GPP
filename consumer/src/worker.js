require('dotenv').config();
const amqp = require('amqplib');
const mongoose = require('mongoose');
const { processActivity } = require('./services/activityProcessor');

const QUEUE_NAME = 'user_activities';

const startWorker = async () => {
    try {
        // Connect to MongoDB
        const dbUrl = process.env.DATABASE_URL || 'mongodb://user:password@localhost:27017/activity_db?authSource=admin';
        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');

        // Connect to RabbitMQ
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
        const connection = await amqp.connect(rabbitUrl);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.prefetch(1); // Process one message at a time

        console.log(`Waiting for messages in ${QUEUE_NAME}...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    await processActivity(content);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Failed to process message:', error.message);
                    // Nack and requeue if it's a transient error, otherwise log and discard
                    // For this task, we'll requeue once or just nack without requeue for malformed data
                    if (error.name === 'SyntaxError') {
                        console.error('Malformed JSON, discarding message');
                        channel.nack(msg, false, false);
                    } else {
                        // Requeue for DB errors or other transient issues
                        console.error('Transient error, requeueing');
                        channel.nack(msg, false, true);
                    }
                }
            }
        });

        // Handle connection close
        connection.on('close', () => {
            console.error('RabbitMQ connection closed, exiting...');
            process.exit(1);
        });

    } catch (error) {
        console.error('Failed to start worker:', error);
        process.exit(1);
    }
};

startWorker();
