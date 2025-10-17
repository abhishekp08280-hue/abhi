import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

app.set('trust proxy', true);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

const registerLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });
app.use('/api/auth/register', registerLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

