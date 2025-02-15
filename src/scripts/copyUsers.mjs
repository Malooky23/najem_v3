// import { db, db1 }from '../server/db';
// import { users }from '../server/db/schema';
// import { eq } from 'drizzle-orm';

// async function copyUsers() {
//     try {
//         // Get all users from the local database
//         const localUsers = await db1.query.users.findMany();
//         console.log(`Found ${localUsers.length} users in local database`);

//         // Copy each user to the main database
//         for (const user of localUsers) {
//             // Check if user already exists in main database
//             const existingUser = await db.query.users.findFirst({
//                 where: eq(users.email, user.email)
//             });

//             if (!existingUser) {
//                 // Insert the user if they don't exist
//                 await db.insert(users).values({
//                     ...user,
//                     // Ensure created/updated dates are handled properly
//                     createdAt: user.createdAt?.toString(),
//                     updatedAt: user.updatedAt?.toString(),
//                     lastLogin: user.lastLogin?.toString()
//                 });
//                 console.log(`Copied user: ${user.email}`);
//             } else {
//                 console.log(`Skipping existing user: ${user.email}`);
//             }
//         }

//         console.log('User copy completed successfully');
//     } catch (error) {
//         console.error('Error copying users:', error);
//     } finally {
//         process.exit(0);
//     }
// }

// copyUsers();
