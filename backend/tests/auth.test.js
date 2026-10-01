require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

// Increase global test timeout to prevent Jest 5000ms timeout on network calls/bcrypt hashing
jest.setTimeout(30000);

describe('Auth & Roles API Endpoints', () => {
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            const dbUri = process.env.MONGODB_URI_TEST || process.env.MONGO_URI;
            if (!dbUri) {
                throw new Error("Database URI is undefined. Please check your .env file.");
            }
            await mongoose.connect(dbUri);
        }
    }, 30000); // 30-second timeout for Atlas connection

    afterEach(async () => {
        if (mongoose.connection.readyState !== 0) {
            await User.deleteMany({});
        }
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    const testUser = {
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        password: 'password123',
        phone_no: '09034582884',
        address: "12 Kosoko Drive, Ikeja GRA",
        state: "Lagos",
        country: "Nigeria",
        account_type: "individual",
    };

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully and return a token', async () => {
            const res = await request(app).post('/api/auth/register').send(testUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', testUser.email);
        });

        it('should fail registration if required fields are missing', async () => {
            const res = await request(app).post('/api/auth/register').send({ email: 'incomplete@example.com' });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
        });
    });
    
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/auth/register').send(testUser);
        });

        it('should authenticate user and return token on correct credentials', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('token');
        });

        it('should reject login with wrong password', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: 'wrongpassword' });
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('GET /api/auth/me (Protected Route)', () => {
        it('should deny access if no token is provided', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.statusCode).toEqual(401);
        });

        it('should return user profile when valid token is provided', async () => {
            const regRes = await request(app).post('/api/auth/register').send(testUser);
            const token = regRes.body.token;

            const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.user).toHaveProperty('email', testUser.email);
        });
    });
});