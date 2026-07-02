import app from './app';
import { config } from './config/env.config';
import prisma from './database/client';

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('Successfully connected to the database.');

        app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
};

startServer();
