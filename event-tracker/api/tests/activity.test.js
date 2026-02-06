const request = require('supertest');
const app = require('../src/server');
const { publishToQueue } = require('../src/services/queueService');

// Mock the queue service
jest.mock('../src/services/queueService');

describe('Activity API', () => {
    const getValidActivity = () => ({
        userId: 'a1b2c3d4-e5f6-4890-8234-567890abcdef',
        eventType: 'user_login',
        timestamp: new Date().toISOString(),
        payload: {
            ipAddress: '192.168.1.1',
            device: 'desktop',
            browser: 'Chrome'
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mock implementation
        publishToQueue.mockResolvedValue(true);
    });

    test('POST /api/v1/activities should return 202 and publish to queue for valid request', async () => {
        const validActivity = getValidActivity();
        const response = await request(app)
            .post('/api/v1/activities')
            .send(validActivity);

        expect(response.status).toBe(202);
        expect(response.body.message).toBe('Event successfully received and queued');
        expect(publishToQueue).toHaveBeenCalled();
    });

    test('POST /api/v1/activities should return 400 for invalid userId (not UUID)', async () => {
        const invalidActivity = { ...getValidActivity(), userId: 'invalid-id' };
        const response = await request(app)
            .post('/api/v1/activities')
            .send(invalidActivity);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });

    test('POST /api/v1/activities should return 400 for missing fields', async () => {
        const invalidActivity = { userId: 'a1b2c3d4-e5f6-4890-8234-567890abcdef' };
        const response = await request(app)
            .post('/api/v1/activities')
            .send(invalidActivity);

        expect(response.status).toBe(400);
    });
});
