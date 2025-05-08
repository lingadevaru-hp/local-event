
'use client';

import { useEffect, useState } from 'react';
import type { Event } from '@/types/event';
import { MOCK_EVENTS_DATA } from '@/lib/mockEvents'; 
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function FeaturedEventsCarousel() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Simulate fetching featured events or use a more sophisticated selection logic
    const selectedFeatured = MOCK_EVENTS_DATA.filter(event => (event.averageRating || 0) >= 4.0 || new Date(event.date) > new Date())
                                           .sort((a,b) => (b.averageRating || 0) - (a.averageRating || 0)) 
                                           .slice(0, 5); // Limit to 5 featured events
    setFeaturedEvents(selectedFeatured);
  }, []);

  if (featuredEvents.length === 0) {
    // Optionally, render a placeholder or nothing if no featured events
    return null; 
  }

  return (
    <section className="mb-12 md:mb-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-primary tracking-tight">
        Featured Events
      </h2>
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        spaceBetween={20}
        slidesPerView={1}
        loop={featuredEvents.length > 1} // Loop only if more than one slide
        autoplay={{
          delay: 4500, 
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true, dynamicBullets: true, el: '.swiper-pagination-custom-featured' }}
        navigation={{
            nextEl: '.swiper-button-next-custom-featured',
            prevEl: '.swiper-button-prev-custom-featured',
        }}
        effect="fade" 
        fadeEffect={{ crossFade: true }}
        className="relative rounded-2xl shadow-2xl overflow-hidden group aspect-[16/9] md:aspect-[20/9]" // Set aspect ratio
      >
        {featuredEvents.map((event, index) => (
          <SwiperSlide key={event.id}>
            <Link href={`/events/${event.id}`} className="block w-full h-full relative group/slide">
              <Image
                src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/675`} // 16:9 aspect ratio
                alt={event.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="object-cover transition-transform duration-700 ease-in-out group-hover/slide:scale-105"
                priority={index === 0} // Load the first image with high priority
                loading={index === 0 ? undefined : "lazy"} // Lazy load subsequent images
                data-ai-hint="featured event banner large"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-10 flex flex-col justify-end">
                <h3 className="text-xl md:text-3xl font-bold text-white drop-shadow-lg line-clamp-2">
                  {event.name}
                </h3>
                <p className="text-sm md:text-base text-gray-200 mt-1.5 drop-shadow-sm line-clamp-1">{event.city}, {event.district}</p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
        {featuredEvents.length > 1 && ( // Show navigation only if multiple slides
          <>
            <div className="swiper-button-prev-custom-featured absolute top-1/2 left-3 md:left-4 z-10 transform -translate-y-1/2 p-2.5 bg-black/30 text-white rounded-full cursor-pointer hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 glassmorphism-dark focus-visible:ring-2 focus-visible:ring-white">
                <ChevronLeft size={28} />
            </div>
            <div className="swiper-button-next-custom-featured absolute top-1/2 right-3 md:right-4 z-10 transform -translate-y-1/2 p-2.5 bg-black/30 text-white rounded-full cursor-pointer hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 glassmorphism-dark focus-visible:ring-2 focus-visible:ring-white">
                <ChevronRight size={28} />
            </div>
            <div className="swiper-pagination-custom-featured absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2.5"></div>
          </>
        )}
      </Swiper>
      {/* Swiper custom pagination styles */}
      <style jsx global>{`
        .swiper-pagination-custom-featured .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background-color: rgba(255, 255, 255, 0.7);
          opacity: 1;
          border-radius: 50%;
          transition: background-color 0.3s, transform 0.3s, width 0.3s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .swiper-pagination-custom-featured .swiper-pagination-bullet-active {
          background-color: white;
          transform: scale(1.2);
          width: 12px; 
        }
        .swiper-button-disabled {
          opacity: 0.3;
          cursor: auto;
        }
      `}</style>
    </section>
  );
}
