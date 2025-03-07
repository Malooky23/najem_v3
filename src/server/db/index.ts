import * as schema from "./schema";
import { config } from "dotenv";
config({ path: ".env" }); // or .env.local
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';

// Determine if we're in production or local environment
const isVercel = process.env.VERCEL === '1' ;

// Function to create local database connection
function createLocalDb() {
  if (!process.env.DATABASE_URL_LOCAL) {
    throw new Error("process.env.DATABASE_URL_LOCAL NOT AVAILABLE");
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL_LOCAL,
  });
  
  return drizzle(pool, { schema });
}

// Function to create production database connection
function createProdDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("process.env.DATABASE_URL NOT AVAILABLE");
  }
  
  return drizzleNeon(process.env.DATABASE_URL, { schema });
}

// Export the appropriate database instance based on environment
export const db = isVercel ? createProdDb() : createLocalDb();

console.log(`Database initialized in ${isVercel ? 'production' : 'local'} mode`);