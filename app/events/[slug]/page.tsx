
import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import BookEvent from '@/app/components/bookevent';
import {IEvent} from '@/database/event.model'
import EventCard from '@/app/components/eventCart';
import { getSimilarEventsBySlug } from '@/lib/actions/serveractions';




const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
  <div className="flex flex-row gap-2 items-center">
    <Image src={icon} alt={alt} width={18} height={13} />
    <p>{label}</p>
  </div>
);



const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag, index) => (
      <div className="pill" key={index}>{tag}</div>
    ))}
  </div>
);

const bookings = 10;

const eventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const request = await fetch(`${BASE_URL}/api/events/${slug}`);
  const { event: { description, location, tags, time, date, agenda, overview, audience, mode, image } } = await request.json();

  if (!description) return notFound();

  const similarEvents = await getSimilarEventsBySlug(slug);

  return (
    <section id="event" className="px-5 sm:px-10 py-10">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        <div className="content">
          <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />
          <section className="column-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <div className="flex-col-gap-2">
            <h2>Event Details</h2>
            <EventDetailItem icon="/icons/calendar.png" label={date} alt="calendar" />
            <EventDetailItem icon="/icons/maps-and-flags.png" label={location} alt="location" />
            <EventDetailItem icon="/icons/clock.png" label={time} alt="time" />
            <EventDetailItem icon="/icons/people.png" label={audience} alt="audience" />
            <EventDetailItem icon="/icons/trophy.png" label={mode} alt="mode" />
          </div>

          <EventAgenda agendaItems={agenda} />

          <EventTags tags={tags} />
        </div>

        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked their spot!
              </p>
            ) : (
              <p className="text-sm">Be the first to book your spot!</p>
            )}
            <BookEvent />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => (
            <EventCard key={similarEvent._id?.toString()} {...similarEvent} />
          ))}
        </div>
      </div>

    </section>
  )
}

export default eventDetailsPage;

