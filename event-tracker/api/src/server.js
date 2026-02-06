require('dotenv').config();
const express = require('express');
const activityRoutes = require('./routes/activityRoutes');
const { connectQueue } = require('./services/queueService');

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Activity routes
app.use('/api/v1', activityRoutes);

// Error handling for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: 'The requested resource does not exist' });
});

const startServer = async () => {
    try {
        // Only attempt to connect to queue if not in test environment (or handle it in service)
        if (process.env.NODE_ENV !== 'test') {
            await connectQueue();
        }
        
        app.listen(PORT, () => {
            console.log(`API Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app; // Export for testing
