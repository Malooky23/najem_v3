
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';


export default defineConfig({
    out: './src/server/drizzle/',
    schema: './src/server/db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URLNEON!,
        ssl: true, // Important for Neon
    },
});

// export default defineConfig({
//     out: './src/server/drizzle/',
//     schema: './src/server/db/schema.ts',
//     driver: 'pg', // Still use 'pg' for migrations
//     dbCredentials: {
//       connectionString: process.env.DATABASE_URL!,
//       ssl: true, // Important for Neon
//     },
//   });