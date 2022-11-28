import express from 'express';
import cors from 'cors';
import * as dotenv_safe from 'dotenv-safe';
import { connectDb } from './db';
import logger from './logger';
import { defendants } from './routes/defendants';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { lawyers } from './routes/lawyer';

dotenv_safe.config();

const port = process.env.PORT || 8000;

const main = async () => {
	try {
		const app = express();

		const RedisStore = connectRedis(session);
		const redis = new Redis();

		app.use(express.json());

		// NOTE: Keep in as comment until deployment method is determined
		// app.use(express.static(path.join(__dirname, './client/build')));

		// app.get('/*', (_, res) => {
		// 	res.sendFile(path.join(__dirname, './client/build', 'index.html'));
		// });

		app.use(
			cors<cors.CorsRequest>({
				origin: ['http://localhost:3000'],
				credentials: true,
			})
		);

		app.use(
			session({
				name: 'qid',
				store: new RedisStore({
					client: redis,
					disableTouch: true,
				}),
				cookie: {
					maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
					httpOnly: true,
					sameSite: 'lax', // csrf
					secure: true, // TODO: switch to constant
				},
				saveUninitialized: false,
				secret: ';kajbsdk;jabsd;kjabsd', //TODO: env variable
				resave: false,
			})
		);

		// Routes
		app.use('/api/defendants', defendants);
		app.use('/api/lawyers', lawyers);
		// TODO: appointments using calendly/outlook

		const connect = async () => {
			try {
				await connectDb(process.env.MONGO_URI ?? '');
				logger.info('Database is connected 🔌 ✅');
			} catch (error) {
				logger.crit('❌ Unable to connect to the database ❌');
				logger.crit(error);
			}
		};
		connect();

		app.listen(port, () => {
			logger.info(`Application is listening on port ${port} 🚀`);
		});
	} catch (error) {
		logger.crit(error);
	}
};
main();
