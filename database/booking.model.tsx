
import { Schema, model, models, Document, Types } from 'mongoose';
import Event from './event.model';

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Create index on eventId for optimized queries
BookingSchema.index({ eventId: 1 });
// Validate that the referenced event exists before saving
BookingSchema.pre('save', async function (next) {
  try {
    // Check if eventId is modified or new document
    if (this.isModified('eventId') || this.isNew) {
      const eventExists = await Event.findById(this.eventId);

      if (!eventExists) {
        throw new Error(`Event with ID ${this.eventId} does not exist`);
      }
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;

