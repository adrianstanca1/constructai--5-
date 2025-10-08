/**
 * Vercel Serverless Function - Enhanced Register
 * POST /api/auth/register
 * 
 * Features:
 * - Rate limiting (3 registrations per hour)
 * - Input validation
 * - Password strength checking
 * - Structured logging
 * - Security headers
 * - Enhanced error handling
 */

import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../middleware/cors';
import { setSecurityHeaders, validateJwtSecret, getClientIp } from '../middleware/security';
import { logger, logRequest, logResponse } from '../middleware/logger';
import { validate, emailRule, passwordRule, nameRule } from '../middleware/validation';
import { registerRateLimit } from '../middleware/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h';

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
        // Validate JWT secret
        validateJwtSecret();

        const { email, password, name, companyName } = req.body;
        const clientIp = getClientIp(req);

        logRequest('POST', '/api/auth/register', { email, ip: clientIp });

        // Validate input
        const validationErrors = validate(req.body, [
            emailRule,
            passwordRule,
            nameRule,
            {
                field: 'companyName',
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 100
            }
        ]);

        if (validationErrors.length > 0) {
            logger.warn('Validation failed', { errors: validationErrors, ip: clientIp });
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: validationErrors
            });
        }

        // Rate limiting
        const rateLimitResult = registerRateLimit(clientIp);
        res.setHeader('X-RateLimit-Limit', '3');
        res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

        if (!rateLimitResult.allowed) {
            logger.warn('Rate limit exceeded', { email, ip: clientIp });
            return res.status(429).json({
                success: false,
                error: 'Too many registration attempts. Please try again later.',
                retryAfter: new Date(rateLimitResult.resetTime).toISOString()
            });
        }

        // Check if user already exists
        const { rows: existingUsers } = await sql`
            SELECT id FROM users WHERE email = ${email} LIMIT 1
        `;

        if (existingUsers.length > 0) {
            logger.warn('Registration failed: Email already exists', { email, ip: clientIp });
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
            logger.info('Using existing company', { companyId, companyName });
        } else {
            companyId = uuidv4();
            await sql`
                INSERT INTO companies (id, name)
                VALUES (${companyId}, ${companyName})
            `;
            logger.info('Created new company', { companyId, companyName });
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
            { 
                userId, 
                email,
                role: 'company_admin'
            },
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

        logger.info('Registration successful', { 
            userId, 
            email, 
            companyId,
            ip: clientIp 
        });

        const duration = Date.now() - startTime;
        logResponse('POST', '/api/auth/register', 200, duration);

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
            token,
            expiresAt: expiresAt.toISOString()
        });
    } catch (error: any) {
        logger.error('Registration error', error, { ip: getClientIp(req) });
        
        const duration = Date.now() - startTime;
        logResponse('POST', '/api/auth/register', 500, duration);
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
