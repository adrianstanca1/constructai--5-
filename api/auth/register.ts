/**
 * Vercel Serverless Function - Register
 * POST /api/auth/register
 */

import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password, name, companyName } = req.body;

        if (!email || !password || !name || !companyName) {
            return res.status(400).json({ 
                success: false,
                error: 'Email, password, name, and company name are required' 
            });
        }

        console.log('📝 Register attempt:', email);

        // Check if user already exists
        const { rows: existingUsers } = await sql`
            SELECT id FROM users WHERE email = ${email} LIMIT 1
        `;

        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false,
                error: 'User with this email already exists' 
            });
        }

        // Find or create company
        const { rows: companies } = await sql`
            SELECT id FROM companies WHERE name = ${companyName} LIMIT 1
        `;

        let companyId;
        if (companies.length > 0) {
            companyId = companies[0].id;
        } else {
            companyId = uuidv4();
            await sql`
                INSERT INTO companies (id, name)
                VALUES (${companyId}, ${companyName})
            `;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const userId = uuidv4();
        await sql`
            INSERT INTO users (id, email, password_hash, name, role, company_id)
            VALUES (${userId}, ${email}, ${passwordHash}, ${name}, 'company_admin', ${companyId})
        `;

        // Generate JWT token
        const token = jwt.sign(
            { userId, email },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        // Create session
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await sql`
            INSERT INTO sessions (id, user_id, token, expires_at)
            VALUES (${sessionId}, ${userId}, ${token}, ${expiresAt.toISOString()})
        `;

        console.log('✅ Registration successful:', name);

        return res.status(200).json({
            success: true,
            user: {
                id: userId,
                email,
                name,
                role: 'company_admin',
                avatar: null,
                companyId
            },
            token
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
}

