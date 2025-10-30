import Link from "next/link";
import Image from "next/image";

interface Props {
  title: string;
  image: string;
  slug: string;
location: string;
date: string;
time: string;
}

const EventCard = ({ title, image ,slug, location, date, time }: Props) => {
  return (
    <Link href={`/events/${slug}`} id="event-card">
      <Image src={image} alt={title} width={440} height={270} className="poster"/>
      <div className="flex flex-row gap-2">
        <Image src="/icons/maps-and-flags.png" alt="location" width={20} height={13} />
        <p>{location}</p>
      </div>
      <p className="title">{title}</p>

      <div className="datetime">
        <div>
          <Image src="/icons/calendar.png" alt="calendar" width={18} height={13}/>
          <p>{date}</p>
        </div>
        <div>
          <Image src="/icons/clock.png" alt="clock" width={23} height={11}/>
          <p>{time}</p>
        </div>
      </div>

    </Link>
  )
}

export default EventCard
