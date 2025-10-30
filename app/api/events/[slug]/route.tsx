
import { NextRequest, NextResponse } from 'next/server';
import Event, { type IEvent } from '@/database/event.model';
import connectDB from '@/lib/db/mongodb';
// Type for route params in Next.js 13+ App Router
type RouteParams = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug.
 * 
 * @param request - NextRequest object (unused but required by Next.js)
 * @param context - Contains route parameters
 * @returns JSON response with event data or error message
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Extract slug from route params (awaited in Next.js 15+)
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { 
          message: 'Invalid slug parameter',
          error: 'Slug must be a non-empty string'
        },
        { status: 400 }
      );
    }

    // Sanitize slug (remove dangerous characters)
    const sanitizedSlug = slug.trim().toLowerCase();
    
    if (sanitizedSlug.length === 0) {
      return NextResponse.json(
        { 
          message: 'Invalid slug',
          error: 'Slug cannot be empty after sanitization'
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Query event by slug with lean() for better performance (returns plain JS object)
    const event = await Event.findOne({ slug: sanitizedSlug }).lean<IEvent>();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { 
          message: 'Event not found',
          error: `No event exists with slug: ${sanitizedSlug}`
        },
        { status: 404 }
      );
    }

    // Return successful response with event data
    return NextResponse.json(
      { 
        event,
        message: 'Event fetched successfully'
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    // Log error for debugging (server-side only)
    console.error('Error fetching event by slug:', error);

    // Type-safe error handling
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific Mongoose/MongoDB errors
      if (error.name === 'CastError') {
        return NextResponse.json(
          { 
            message: 'Invalid query parameter',
            error: 'Malformed slug format'
          },
          { status: 400 }
        );
      }
      
      // Handle database connection errors
      if (error.message.includes('ECONNREFUSED') || error.message.includes('MongoNetworkError')) {
        return NextResponse.json(
          { 
            message: 'Database connection failed',
            error: 'Unable to connect to the database. Please try again later.'
          },
          { status: 503 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { 
        message: 'Failed to fetch event',
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

