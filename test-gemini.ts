/**
 * Test Gemini API Connection
 */

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

async function testGemini() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not found in environment');
        }

        console.log('🤖 Initializing Gemini...');
        const genAI = new GoogleGenerativeAI(apiKey);

        // Try with gemini-2.5-flash (latest model)
        const modelName = 'gemini-2.5-flash';
        console.log(`💬 Using model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        console.log('💬 Sending test message...');
        const result = await model.generateContent('Say hello in Romanian!');
        const response = await result.response;
        const text = response.text();

        console.log('✅ Response:', text);
        console.log('\n🎉 Gemini API is working correctly!');
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testGemini();

