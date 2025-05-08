
'use client';

import { useEffect, useState } from 'react';
import type { Event } from '@/types/event';
import { MOCK_EVENTS_DATA } from '@/lib/mockEvents'; // Using mock data for now
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade'; // Import fade effect CSS
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function FeaturedEventsCarousel() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Simulate fetching featured events (e.g., top-rated or upcoming)
    const selectedFeatured = MOCK_EVENTS_DATA.filter(event => (event.averageRating || 0) >= 4.5 || new Date(event.date) > new Date())
                                           .sort((a,b) => (b.averageRating || 0) - (a.averageRating || 0)) // Sort by rating
                                           .slice(0, 5); // Take top 5
    setFeaturedEvents(selectedFeatured);
  }, []);

  if (featuredEvents.length === 0) {
    return null; // Don't render if no featured events
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-primary">Featured Events</h2>
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        spaceBetween={20}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true, dynamicBullets: true, el: '.swiper-pagination-custom' }}
        navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
        }}
        effect="fade" // Using fade effect
        fadeEffect={{ crossFade: true }}
        className="relative rounded-xl shadow-xl overflow-hidden group"
      >
        {featuredEvents.map((event, index) => ( // Added index for priority
          <SwiperSlide key={event.id}>
            <Link href={`/events/${event.id}`} className="block aspect-[16/9] md:aspect-[21/9] w-full h-full relative">
              <Image
                src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/500`}
                alt={event.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                priority={index === 0} // Prioritize first image
                data-ai-hint="featured event banner"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6 md:p-10 flex flex-col justify-end">
                <h3 className="text-xl md:text-3xl font-bold text-white drop-shadow-lg line-clamp-2">
                  {event.name}
                </h3>
                <p className="text-sm md:text-base text-gray-200 mt-1 drop-shadow-sm line-clamp-1">{event.city}, {event.district}</p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
        {/* Custom Navigation Buttons */}
        <div className="swiper-button-prev-custom absolute top-1/2 left-3 z-10 transform -translate-y-1/2 p-2 bg-black/30 text-white rounded-full cursor-pointer hover:bg-black/50 transition-opacity opacity-0 group-hover:opacity-100">
            <ChevronLeft size={28} />
        </div>
        <div className="swiper-button-next-custom absolute top-1/2 right-3 z-10 transform -translate-y-1/2 p-2 bg-black/30 text-white rounded-full cursor-pointer hover:bg-black/50 transition-opacity opacity-0 group-hover:opacity-100">
            <ChevronRight size={28} />
        </div>
        {/* Custom Pagination Container */}
        <div className="swiper-pagination-custom absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2"></div>
      </Swiper>
      {/* Swiper custom pagination styles - can be in globals.css or here if scoped */}
      <style jsx global>{`
        .swiper-pagination-custom .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background-color: rgba(255, 255, 255, 0.5);
          opacity: 1;
          border-radius: 50%;
          transition: background-color 0.3s, transform 0.3s;
        }
        .swiper-pagination-custom .swiper-pagination-bullet-active {
          background-color: white;
          transform: scale(1.2);
        }
      `}</style>
    </section>
  );
}

