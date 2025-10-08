/**
 * Vercel Serverless Function - Enhanced Logout
 * POST /api/auth/logout
 * 
 * Features:
 * - Rate limiting (60 requests per minute)
 * - Token validation
 * - Session cleanup
 * - Security headers
 * - Structured logging
 * - Performance tracking
 */

import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../middleware/cors';
import { setSecurityHeaders, getClientIp } from '../middleware/security';
import { logger, logRequest, logResponse } from '../middleware/logger';
import { apiRateLimit } from '../middleware/rateLimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const startTime = Date.now();
    
    // Set security headers
    setSecurityHeaders(res);
    
    // Handle CORS
    if (handleCors(req, res)) {
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed' 
        });
    }

    try {
        const clientIp = getClientIp(req);
        logRequest('POST', '/api/auth/logout', { ip: clientIp });

        // Rate limiting
        const rateLimitResult = apiRateLimit(clientIp);
        res.setHeader('X-RateLimit-Limit', '60');
        res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

        if (!rateLimitResult.allowed) {
            logger.warn('Rate limit exceeded', { ip: clientIp });
            return res.status(429).json({
                success: false,
                error: 'Too many requests. Please try again later.',
                retryAfter: new Date(rateLimitResult.resetTime).toISOString()
            });
        }

        // Extract token
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            logger.warn('Missing token', { ip: clientIp });
            return res.status(401).json({
                success: false,
                error: 'Authentication token is required'
            });
        }

        // Get session info before deleting (for logging)
        const { rows: sessions } = await sql`
            SELECT user_id FROM sessions WHERE token = ${token} LIMIT 1
        `;

        // Delete session from database
        const result = await sql`
            DELETE FROM sessions WHERE token = ${token}
        `;

        if (sessions.length > 0) {
            logger.info('Logout successful', { 
                userId: sessions[0].user_id,
                ip: clientIp 
            });
        } else {
            logger.warn('Logout attempted with invalid token', { ip: clientIp });
        }

        const duration = Date.now() - startTime;
        logResponse('POST', '/api/auth/logout', 200, duration);

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error: any) {
        logger.error('Logout error', error, { ip: getClientIp(req) });
        
        const duration = Date.now() - startTime;
        logResponse('POST', '/api/auth/logout', 500, duration);
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
