import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import { errorMiddleware } from './middleware/error.middleware';
import { AppError } from './shared/errors/AppError';

// Import Old Routes
import authRoutes from './modules/auth/auth.routes';
import messagingRoutes from './modules/messaging/messaging.routes';
import eventsRoutes from './modules/events/events.routes';
import meetingsRoutes from './modules/meetings/meetings.routes';
import adminRoutes from './modules/admins/admins.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import mediaRoutes from './modules/media/media.routes';
import packsRoutes from './modules/packs/packs.routes';
import formsRoutes from './modules/forms/forms.routes';
import expertRoutes from './modules/experts/experts.routes';
import performanceRoutes from './modules/performance/performance.routes';
import chatbotRoutes from './modules/chatbot/chatbot.routes';
import contactRoutes from './modules/contact/contact.routes';
import clubsRoutes from './modules/clubs/clubs.routes';

// Import New Routes
import programsRoutes from './modules/programs/programs.routes';
import orientationRoutes from './modules/orientation/orientation.routes';

const app: Express = express();

// Required when running behind nginx/Next.js so rate-limit reads X-Forwarded-For correctly
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware
app.use(morgan('dev'));

// Session Storage
let redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' })
redisClient.connect().catch(console.error)

// @ts-ignore: connect-redis exported types mismatch in some envs
let redisStore = new RedisStore({
    client: redisClient,
    prefix: "bideya_sess:",
})

app.use(
    session({
        store: redisStore,
        resave: false,
        saveUninitialized: false,
        secret: process.env.JWT_SECRET || 'supersecretjwtkey',
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }
    })
);

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// API Routes
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK' });
});

// Mount Old Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/messaging', messagingRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/meetings', meetingsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/packs', packsRoutes);
app.use('/api/v1/forms', formsRoutes);
app.use('/api/v1/experts', expertRoutes);
app.use('/api/v1/performance', performanceRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/clubs', clubsRoutes);

// Mount New Routes
app.use('/api/programs', programsRoutes);
app.use('/api/orientation', orientationRoutes);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError('Path not found', 404));
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    errorMiddleware(err, req, res, next);
});

export default app;
