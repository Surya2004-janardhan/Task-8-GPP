const { processActivity } = require('../src/services/activityProcessor');
const Activity = require('../src/models/Activity');

jest.mock('../src/models/Activity');

describe('Activity Processor', () => {
    const validMessage = {
        userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        eventType: 'user_login',
        timestamp: '2023-10-27T10:00:00Z',
        payload: {
            ipAddress: '192.168.1.1'
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should save activity to database successfully', async () => {
        // Mock save method
        Activity.prototype.save = jest.fn().mockResolvedValue(true);

        const result = await processActivity(validMessage);

        expect(result).toBe(true);
        expect(Activity.prototype.save).toHaveBeenCalled();
    });

    test('should throw error if database save fails', async () => {
        Activity.prototype.save = jest.fn().mockRejectedValue(new Error('DB Error'));

        await expect(processActivity(validMessage)).rejects.toThrow('DB Error');
    });
});
