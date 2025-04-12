
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';


// export default defineConfig({
//     out: './src/server/drizzle/',
//     schema: './src/server/db/schema.ts',
//     dialect: 'postgresql',
//     dbCredentials: {
//         url: process.env.DATABASE_URLNEON!,
//         ssl: true, // Important for Neon
//     },
// });

export default defineConfig({
    out: './src/server/drizzle/',
    schema: './src/server/db/schema.ts',
    dialect: 'postgresql', // Still use 'pg' for migrations
    dbCredentials: {
      // url: process.env.DATABASE_URL_LOCAL!,
      url: process.env.VERCEL === '1' ? process.env.DATABASE_URL! : process.env.DATABASE_URL_LOCAL! as string,
    //   ssl: true, // Important for Neon
    },
    
  });

