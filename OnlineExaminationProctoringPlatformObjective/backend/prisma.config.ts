// prisma.config.ts — Prisma 7.x datasource configuration
import path from 'path';
import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
    earlyAccess: true,
    schema: path.resolve(__dirname, 'prisma/schema.prisma'),
    datasource: {
        url: process.env.DATABASE_URL as string,
    },
});
