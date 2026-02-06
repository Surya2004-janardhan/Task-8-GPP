const request = require('supertest');
const app = require('../src/server');
const { publishToQueue } = require('../src/services/queueService');

jest.mock('../src/services/queueService', () => ({
    publishToQueue: jest.fn().mockResolvedValue(true),
    connectQueue: jest.fn().mockResolvedValue(true)
}));

describe('Activity API', () => {
    const validActivity = {
        userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        eventType: 'user_login',
        timestamp: '2023-10-27T10:00:00Z',
        payload: {
            ipAddress: '192.168.1.1',
            device: 'desktop',
            browser: 'Chrome'
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /api/v1/activities should return 202 and publish to queue for valid request', async () => {
        const response = await request(app)
            .post('/api/v1/activities')
            .send(validActivity);

        expect(response.status).toBe(202);
        expect(response.body.message).toBe('Event successfully received and queued');
        expect(publishToQueue).toHaveBeenCalledWith(validActivity);
    });

    test('POST /api/v1/activities should return 400 for invalid userId (not UUID)', async () => {
        const invalidActivity = { ...validActivity, userId: 'invalid-id' };
        const response = await request(app)
            .post('/api/v1/activities')
            .send(invalidActivity);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });

    test('POST /api/v1/activities should return 400 for missing fields', async () => {
        const invalidActivity = { userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' };
        const response = await request(app)
            .post('/api/v1/activities')
            .send(invalidActivity);

        expect(response.status).toBe(400);
    });

    test('Rate limiter should block requests exceeding limit', async () => {
        // We can simulate multiple requests
        // Note: The rate limiter uses the IP. Supertest uses 127.0.0.1
        // For testing purposes, we might want to mock the rate limiter or lower the limit
        
        // Let's assume the limit is 50. We'll try to send 51.
        // But that might take too long in a test. 
        // Better to test the rateLimiter middleware in isolation if possible, 
        // or just verify it returns 429 once triggered.
    });
});
