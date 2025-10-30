
export type EventItem = {
  image: string;
  title: string;
  slug: string;
  location: string;
  date: string; // e.g., "2025-11-07"
  time: string; // e.g., "09:00 AM"
};

// Curated list of upcoming/popular developer events.
// Image 💡 Refactor Q < > ⚡️lic/images and can be used directly with next
// via paths like "/images/event1.png".
export const events: EventItem[] = [
  {
    image: "/images/event1.png",
    title: "React Summit US 2025",
    slug: "react-summit-us-2025",
    location: "San Francisco, CA, USA",
    date: "2025-11-07",
    time: "09:00 AM",
  },
  {
    image: "/images/event2.png",
    title: "KubeCon + CloudNativeCon Europe 2026",
    slug: "kubecon-cloudnativecon-europe-2026",
    location: "Paris, France",
    date: "2026-03-24",
    time: "09:00 AM",
  },
  {
    image: "/images/event3.jpg",
    title: "AWS re:Invent 2025",
    slug: "aws-reinvent-2025",
    location: "Paris, France",
    date: "2026-03-24",
    time: "09:00 AM",
  },
  {
    image: "/images/event4.png",
    title: "Next.js Conf 2025",
    slug: "nextjs-conf-2025",
    location: "Paris, France",
    date: "2026-03-24",
    time: "09:00 AM",
  },
  {
    image: "/images/event5.png",
    title: "Google Cloud Next 2026",
    slug: "google-cloud-next-2026",
    location: "Paris, France",
    date: "2026-03-24",
    time: "09:00 AM",
  },
  {
    image: "/images/event5.png",
    title: "ETHGlobal Hackathon: Paris 2026",
    slug: "ethglobal-hackathon-paris-2026",
    location: "Paris, France",
    date: "2026-03-24",
    time: "09:00 AM",
  },
];
