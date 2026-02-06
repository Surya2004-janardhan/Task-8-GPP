const amqp = require('amqplib');

const QUEUE_NAME = 'user_activities';
let channel = null;
let connection = null;

const connectQueue = async () => {
    try {
        if (channel) return channel;

        const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
        connection = await amqp.connect(url);
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        
        console.log('Connected to RabbitMQ');
        
        connection.on('error', (err) => {
            console.error('RabbitMQ connection error', err);
            channel = null;
        });
        
        connection.on('close', () => {
            console.log('RabbitMQ connection closed');
            channel = null;
        });

        return channel;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
        throw error;
    }
};

const publishToQueue = async (data) => {
    try {
        const chan = await connectQueue();
        const msg = JSON.stringify(data);
        const result = chan.sendToQueue(QUEUE_NAME, Buffer.from(msg), { persistent: true });
        return result;
    } catch (error) {
        console.error('Error publishing to queue', error);
        throw error;
    }
};

module.exports = {
    publishToQueue,
    connectQueue
};
