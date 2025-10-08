/**
 * Express Server with Real Authentication
 * JWT-based auth with SQLite database
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database';
import * as auth from './auth';

// Load environment variables from .env.local first, then .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

/**
 * Auth Routes
 */

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await auth.login(email, password);
        
        res.json({
            success: true,
            user: result.user,
            token: result.token
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(401).json({ 
            success: false,
            error: error.message || 'Login failed' 
        });
    }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, companyName } = req.body;

        if (!email || !password || !name || !companyName) {
            return res.status(400).json({ 
                error: 'Email, password, name, and company name are required' 
            });
        }

        const result = await auth.register({
            email,
            password,
            name,
            companyName
        });
        
        res.json({
            success: true,
            user: result.user,
            token: result.token
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(400).json({ 
            success: false,
            error: error.message || 'Registration failed' 
        });
    }
});

// POST /api/auth/logout
app.post('/api/auth/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        await auth.logout(token);
        
        res.json({ success: true });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(400).json({ 
            success: false,
            error: error.message || 'Logout failed' 
        });
    }
});

// GET /api/auth/me
app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Token is required' });
        }

        const user = await auth.verifyToken(token);
        
        res.json({
            success: true,
            user
        });
    } catch (error: any) {
        console.error('Verify token error:', error);
        res.status(401).json({ 
            success: false,
            error: error.message || 'Invalid token' 
        });
    }
});

// POST /api/auth/refresh
app.post('/api/auth/refresh', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const result = await auth.refreshToken(token);
        
        res.json({
            success: true,
            user: result.user,
            token: result.token
        });
    } catch (error: any) {
        console.error('Refresh token error:', error);
        res.status(401).json({ 
            success: false,
            error: error.message || 'Token refresh failed' 
        });
    }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

/**
 * Error handler
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

/**
 * Chat Routes (AI Chatbot)
 */

// GET /api/chat/message - Get chat history
app.get('/api/chat/message', auth.authenticateToken, async (req, res) => {
    try {
        // For now, return empty history
        // TODO: Implement chat history from database
        res.json({
            success: true,
            data: [],
        });
    } catch (error: any) {
        console.error('Chat history error:', error);
        res.status(500).json({ error: error.message || 'Failed to load chat history' });
    }
});

// POST /api/chat/message
app.post('/api/chat/message', auth.authenticateToken, async (req, res) => {
            try {
                const { message, sessionId, currentPage } = req.body;
                const userId = (req as any).user.id;
                const companyId = (req as any).user.company_id;

                // Import chatbot dynamically
                const { GeminiChatbot } = await import('../lib/ai/gemini-client');
                const { ChatTools } = await import('../lib/ai/chat-tools');

                // Build context
                const chatContext = {
                    userId,
                    companyId,
                    userName: (req as any).user.name,
                    companyName: (req as any).user.company?.name || 'Company',
                    userRole: (req as any).user.role,
                    currentPage,
                    availableData: {},
                };

                // Initialize chatbot
                const chatbot = new GeminiChatbot();
                await chatbot.initializeChat(chatContext, []);

                // Send message
                const response = await chatbot.sendMessage(message, chatContext);

                res.json({
                    success: true,
                    data: {
                        message: response.message,
                        toolResults: [],
                        pendingConfirmations: [],
                    },
                });
            } catch (error: any) {
                console.error('Chat error:', error.message);
                res.status(500).json({ error: error.message || 'Chat failed' });
            }
        });

/**
 * Start server
 */
const startServer = async () => {
    try {
        // Initialize database
        await initDatabase();

        // Clean up expired sessions every hour
        setInterval(() => {
            auth.cleanupExpiredSessions();
        }, 60 * 60 * 1000);

        // Start listening
        app.listen(PORT, () => {
            console.log('');
            console.log('🚀 ConstructAI Auth Server');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`✅ Database initialized`);
            console.log(`✅ Ready to accept requests`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');
            console.log('Available endpoints:');
            console.log(`  POST   http://localhost:${PORT}/api/auth/login`);
            console.log(`  POST   http://localhost:${PORT}/api/auth/register`);
            console.log(`  POST   http://localhost:${PORT}/api/auth/logout`);
            console.log(`  GET    http://localhost:${PORT}/api/auth/me`);
            console.log(`  POST   http://localhost:${PORT}/api/auth/refresh`);
            console.log(`  POST   http://localhost:${PORT}/api/chat/message`);
            console.log(`  GET    http://localhost:${PORT}/api/health`);
            console.log('');
            console.log('🤖 AI Chatbot Ready!');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

