

// import { drizzle } from 'drizzle-orm/postgres-js'
// import postgres from 'postgres'
// import * as schema from './schema'
// import * as dotenv from 'dotenv'


// const connectionString = encodeURI(process.env.DATABASE_URL!)
// if (!connectionString) {
//     console.log(connectionString)
// 	throw new Error("process.env.DATABASE_URL NOT AVAILABLE");
// }

// // Disable prefetch as it is not supported for "Transaction" pool mode
// const client = postgres(connectionString, { prepare: false })
// export const db = drizzle({client,schema});


import * as schema from "./schema";
import { config } from "dotenv";
config({ path: ".env" }); // or .env.local
import { drizzle } from "drizzle-orm/node-postgres";

import { Pool } from "pg";


const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
});

if (!process.env.DATABASE_URL) {
	throw new Error("process.env.DATABASE_URL NOT AVAILABLE");
}
// export const db = drizzle(process.env.DATABASE_URL);



export const db = drizzle(pool, { schema });



