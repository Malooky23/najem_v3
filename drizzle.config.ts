
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';


export default defineConfig({
    out: './src/server/drizzle/',
    schema: './src/server/db/schema',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
