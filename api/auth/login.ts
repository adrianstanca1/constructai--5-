/**
 * Vercel Serverless Function - Login
 * POST /api/auth/login
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

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Email and password are required' 
            });
        }

        console.log('🔐 Login attempt:', email);

        // Find user
        const { rows } = await sql`
            SELECT * FROM users WHERE email = ${email} LIMIT 1
        `;

        if (rows.length === 0) {
            console.error('❌ User not found');
            return res.status(401).json({ 
                success: false,
                error: 'Invalid email or password' 
            });
        }

        const user = rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            console.error('❌ Invalid password');
            return res.status(401).json({ 
                success: false,
                error: 'Invalid email or password' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        // Create session in database
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await sql`
            INSERT INTO sessions (id, user_id, token, expires_at)
            VALUES (${sessionId}, ${user.id}, ${token}, ${expiresAt.toISOString()})
        `;

        console.log('✅ Login successful:', user.name);

        // Return user data (without password) and token
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                companyId: user.company_id
            },
            token
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
}

