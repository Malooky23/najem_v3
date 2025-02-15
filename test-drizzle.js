
import 'dotenv/config';


import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
 


async function testConnection() {
    console.log(process.env.DATABASE_URL)

    // const db = drizzle(process.env.DATABASE_URL);
 
    // console.log(process.env.DATABASE_URL)
    // const result = await db.execute('select 1');
    // console.log(result)
}

testConnection();