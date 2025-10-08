/**
 * Vercel Serverless Function - Get Current User
 * GET /api/auth/me
 */

import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: 'Token is required' 
            });
        }

        // Verify JWT
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

        // Check if session exists in database
        const { rows: sessions } = await sql`
            SELECT * FROM sessions WHERE token = ${token} LIMIT 1
        `;

        if (sessions.length === 0) {
            return res.status(401).json({ 
                success: false,
                error: 'Session not found' 
            });
        }

        const session = sessions[0];

        // Check if session expired
        if (new Date(session.expires_at) < new Date()) {
            await sql`DELETE FROM sessions WHERE token = ${token}`;
            return res.status(401).json({ 
                success: false,
                error: 'Session expired' 
            });
        }

        // Get user
        const { rows: users } = await sql`
            SELECT * FROM users WHERE id = ${payload.userId} LIMIT 1
        `;

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        const user = users[0];

        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                companyId: user.company_id
            }
        });
    } catch (error: any) {
        console.error('Verify token error:', error);
        return res.status(401).json({ 
            success: false,
            error: 'Invalid or expired token' 
        });
    }
}

