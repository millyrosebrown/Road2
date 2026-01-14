// Appwrite Configuration for ROAD2
import { Client, Account, Databases, ID, Query } from 'appwrite';

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('69642b100039d0621438');

// Initialize Services
export const account = new Account(client);
export const databases = new Databases(client);

// Database Configuration
export const DATABASE_ID = '69642bc20019d5188799';

// Collection IDs (you'll need to create these in Appwrite Console)
export const COLLECTIONS = {
    USERS: 'users',           // Patient profiles
    GOALS: 'goals',           // Daily goals
    EXERCISES: 'exercises',   // Exercise logs
    JOURNEYS: 'journeys',     // Recovery journey progress
};

// Export utilities
export { ID, Query, client };
