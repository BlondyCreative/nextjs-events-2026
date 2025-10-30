
import Event from "@/database/event.model";
import type { IEvent } from '@/database/event.model';
import connectDB from '@/lib/db/mongodb'

export const getSimilarEventsBySlug = async (slug: string): Promise<IEvent[]> => {
  try {
    await connectDB();
    const event = await Event.findOne({ slug });

    if (!event) {
      return [];
    }

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags }
    }).lean<IEvent[]>();

    return similarEvents || [];
  } catch (error) {
    console.error('Error fetching similar events:', error);
    return [];
  }
};