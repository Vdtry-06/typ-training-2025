const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const MONGODB_URI = process.env.MONGODB_URI;
const Redis = require('ioredis');
require("dotenv").config();

const REDIS_URL = process.env.REDIS_URL
const redis = new Redis(REDIS_URL);
redis.on('connect', () => {console.log(`Connected to Redis at ${REDIS_URL}`)});
redis.on('error', (err) => {console.error('Redis connection error:', err)});

function generateUsers() {
    const users = [];

    for (let i = 1; i < 100; i++) {
        users.push({
            userId : `user${i}`,
            username : `username ${i}`,
            email : `email${i}`,
            password : bcrypt.hashSync(`password${i}`, 10),
            score: 0,
            solved: 0,
            submission: 0,
            rank: i,
            createAt: new Date(),
        });
    }

    return users;
}

async function seedDatabase() {
    let client;
    const LOCK_KEY = process.env.LOCK_KEY;
    const LOCK_TTL = process.env.LOCK_TTL;

    try {

        const lock = await redis.set(LOCK_KEY, "locked", "NX", "EX", LOCK_TTL);

        if (!lock) {
            console.log("userId had been by another instance. Exiting...");
            return
        }

        console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
        client = await MongoClient.connect(MONGODB_URI);
        const db = client.db("users");
    
        await db.collection("users").deleteMany({});
        const users = generateUsers();

        users.forEach(user => {
            console.log(`Inserting user: ${user.userId}`);
            process.stdout.write('', () => {});
        });

        const result = await db.collection("users").insertMany(users);

        console.log(`Successfully inserted ${result.insertedCount} users.`);
        process.stdout.write('', () => {});
        await new Promise(r => setTimeout(r, 100));

        await db.collection("users").createIndex({ userId: 1 }, { unique: true });
        await db.collection("users").createIndex({ username: 1 }, { unique: true });
        await db.collection("users").createIndex({ email: 1 }, { unique: true });
        await db.collection("users").createIndex({ score: -1 });
    } catch (err) {
        console.error("Error seeding database:", err);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log("MongoDB connection closed.");
        }

        await redis.del(LOCK_KEY);
        redis.quit();
        console.log("redis connection closed.");
    }
}

seedDatabase().catch(console.error);