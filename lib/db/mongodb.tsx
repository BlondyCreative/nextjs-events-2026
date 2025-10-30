import mongoose, { ConnectOptions } from "mongoose";

/**
 * MongoDB connection helper for Next.js (TypeScript + Mongoose).
 *
 * - Validates the presence of the MONGODB_URI environment variable.
 * - Caches the connection on the global object to avoid creating multiple
 *   connections during development (Next.js hot reloading).
 * - Provides strong typings (no `any`).
 */

// Read and validate the MongoDB connection string from environment variables.
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI || MONGODB_URI.length === 0) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}
// Narrow the type after validation so it is treated as a definite string.
const MONGODB_URI_STR: string = MONGODB_URI;

// A strongly-typed cached connection shape.
type MongooseConnection = typeof mongoose;
interface Cached {
  conn: MongooseConnection | null;
  promise: Promise<MongooseConnection> | null;
}

// Augment the Node.js global type so we can safely attach a cache.
declare global {
  var _mongooseCache: Cached | undefined;
}

// Reuse an existing cache if present, otherwise initialize a new one.
const cached: Cached = globalThis._mongooseCache ?? { conn: null, promise: null };

/**
 * Establishes (or reuses) a Mongoose connection.
 *
 * This function is safe to call multiple times across API routes, Route Handlers,
 * and server components, as it reuses the same connection in development.
 */
export async function connectToDatabase(): Promise<MongooseConnection> {
  // Return existing connection if already established.
  if (cached.conn) return cached.conn;

  // Create a new connection promise if one isn't already in-flight.
  if (!cached.promise) {
    const opts: ConnectOptions = {
      bufferCommands: false, // rely on driver buffering, avoid Mongoose buffering
      maxPoolSize: 10, // reasonable default pool size
      serverSelectionTimeoutMS: 5000, // fast fail if server is unreachable
    };

    cached.promise = mongoose.connect(MONGODB_URI_STR, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset the promise so future calls can retry after a failure.
    cached.promise = null;
    throw err;
  }

  // Persist the cache on the global object for reuse (especially during HMR).
  globalThis._mongooseCache = cached;
  return cached.conn;
}

export default connectToDatabase;
