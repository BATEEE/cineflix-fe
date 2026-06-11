import React from "react";
import { Play, Info } from "lucide-react";
import { Link } from "react-router-dom";

export interface HeroMovie {
  id: number;
  title: string;
  description?: string;
  backdropPath: string;
  rating?: number;
  genres?: string[];
}

interface HeroBannerProps {
  movie?: HeroMovie | null;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movie }) => {
  if (!movie) {
    return (
      <div className="w-full h-[75vh] sm:h-[85vh] bg-brand-bg animate-pulse"></div>
    );
  }

  return (
    <div className="relative w-full h-[75vh] sm:h-[85vh] lg:h-[95vh] flex items-end pb-32 sm:pb-48">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={movie.backdropPath}
          alt={movie.title}
          className="w-full h-full object-cover object-top"
        />
        {/* Gradient overlays to blend into background */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-brand-red font-bold tracking-widest text-sm drop-shadow-md">
              NỔI BẬT HÔM NAY
            </span>
            {(movie.rating || (movie.genres && movie.genres.length > 0)) && (
              <div className="flex items-center gap-2">
                {movie.rating !== undefined && movie.rating > 0 && (
                  <span className="text-green-400 font-medium text-sm drop-shadow-md">
                    {movie.rating.toFixed(1)} Điểm
                  </span>
                )}
                {movie.genres && movie.genres.length > 0 && (
                  <span className="text-gray-300 text-sm drop-shadow-md border-l border-gray-500 pl-2">
                    {movie.genres.slice(0, 2).join(" • ")}
                  </span>
                )}
              </div>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-lg leading-tight uppercase">
            {movie.title}
          </h1>

          {movie.description && (
            <p className="text-base sm:text-lg text-gray-200 mb-6 max-w-xl drop-shadow-md leading-relaxed line-clamp-3">
              {movie.description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
            <Link
              to={`/watch/${movie.id}`}
              className="flex items-center justify-center gap-2 bg-white text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-md font-bold text-base sm:text-lg hover:bg-gray-200 transition-colors"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black" />
              Phát
            </Link>
            <Link
              to={`/movie/${movie.id}`}
              className="flex items-center justify-center gap-2 bg-gray-500/50 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-md font-bold text-base sm:text-lg hover:bg-gray-500/70 transition-colors backdrop-blur-sm"
            >
              <Info className="w-5 h-5 sm:w-6 sm:h-6" />
              Chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
