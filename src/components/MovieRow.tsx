import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Movie {
  id: number;
  title: string;
  posterPath: string;
  isPremium?: boolean;
  progress?: number; // for "continue watching"
}

interface MovieRowProps {
  title: string;
  movies: Movie[];
  isContinueWatching?: boolean;
}

export const MovieRow: React.FC<MovieRowProps> = ({ title, movies, isContinueWatching = false }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="py-6 relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 drop-shadow-md">{title}</h2>
      
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={12}
        slidesPerView={2}
        navigation
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 16 },
          768: { slidesPerView: 4, spaceBetween: 16 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
          1280: { slidesPerView: 6, spaceBetween: 20 },
          1536: { slidesPerView: 8, spaceBetween: 20 },
        }}
        className="movie-swiper"
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <div className="relative group rounded-md overflow-hidden bg-gray-900 transition-transform duration-300 hover:scale-105 hover:z-20">
              <Link to={`/movie/${movie.id}`} className="block w-full h-full aspect-[2/3] relative">
                <img
                  src={movie.posterPath}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Premium Badge */}
                {movie.isPremium && (
                  <div className="absolute top-2 left-2 bg-brand-gold text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                    👑 VIP
                  </div>
                )}

                {/* Hover overlay with Play button */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                    <Play className="w-5 h-5 text-white ml-1 fill-white" />
                  </div>
                </div>
              </Link>
              
              {/* Progress Bar for Continue Watching */}
              {isContinueWatching && movie.progress !== undefined && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-600">
                  <div 
                    className="h-full bg-brand-red" 
                    style={{ width: `${movie.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Custom CSS to hide Swiper default navigation buttons when not hovering, and style them */}
      <style>{`
        .movie-swiper {
          overflow: visible;
        }
        .movie-swiper .swiper-button-next,
        .movie-swiper .swiper-button-prev {
          color: white;
          background: rgba(0,0,0,0.5);
          width: 40px;
          height: 100%;
          top: 0;
          margin-top: 0;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .movie-swiper:hover .swiper-button-next,
        .movie-swiper:hover .swiper-button-prev {
          opacity: 1;
        }
        .movie-swiper .swiper-button-next { right: 0; border-radius: 4px 0 0 4px; }
        .movie-swiper .swiper-button-prev { left: 0; border-radius: 0 4px 4px 0; }
        .movie-swiper .swiper-button-next::after,
        .movie-swiper .swiper-button-prev::after {
          font-size: 20px;
          font-weight: bold;
        }
        .movie-swiper .swiper-button-disabled {
          opacity: 0 !important;
        }
      `}</style>
    </div>
  );
};
