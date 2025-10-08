/**
 * Vercel Serverless Function - Logout
 * POST /api/auth/logout
 */

import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: 'Token is required' 
            });
        }

        // Delete session from database
        await sql`DELETE FROM sessions WHERE token = ${token}`;

        console.log('✅ Logout successful');

        return res.status(200).json({
            success: true
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
}

