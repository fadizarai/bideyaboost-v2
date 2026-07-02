import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '.prisma/client';
import bcrypt from 'bcryptjs';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Admin
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@bideya.com' },
        update: {},
        create: {
            email: 'admin@bideya.com',
            passwordHash,
            name: 'System Admin',
            admin: {
                create: {},
            },
        },
    });

    console.log('Seed data created successfully:', { adminUser });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
