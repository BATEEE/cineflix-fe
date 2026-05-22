import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Heart, Share2, Star, Clock, Calendar, Film } from "lucide-react";
import { TrailerModal } from "@/components/TrailerModal";
import movieService, { type MovieDetail } from "@/services/movieService";
import favListService from "@/services/favListService";
import ratingService from "@/services/ratingService";
import { useAuthStore } from "@/stores/authStore";

export const MovieDetailPage = () => {
  const { id } = useParams();
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [movieDetail, setMovieDetail] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVipModal, setShowVipModal] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!id) return;

    const fetchMovie = async () => {
      setLoading(true);
      try {
        const data = await movieService.getById(Number(id));
        setMovieDetail(data);

        if (isAuthenticated) {
          const [favStatus, rating] = await Promise.all([
            favListService.check(Number(id)),
            ratingService.getUserRating(Number(id)),
          ]);
          setIsFavorite(favStatus);
          if (rating) {
            setUserRating(rating);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết phim:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated || !movieDetail) {
      alert("Vui lòng đăng nhập để sử dụng tính năng này!");
      return;
    }

    try {
      if (isFavorite) {
        await favListService.remove(movieDetail.id);
        setIsFavorite(false);
      } else {
        await favListService.add(movieDetail.id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper cho ảnh
  const getImageUrl = (url?: string | null) => {
    if (!url || url.trim() === "") {
      return "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop";
    }
    if (url.startsWith("http")) return url;
    return `http://localhost:5063${url.startsWith("/") ? "" : "/"}${url}`;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-brand-red rounded-full animate-spin" />
        <span className="text-zinc-500 font-medium tracking-wide">
          Đang tải thông tin phim...
        </span>
      </div>
    );

  if (!movieDetail)
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-white text-lg">
        Không tìm thấy thông tin bộ phim này.
      </div>
    );

  const rawCover =
    movieDetail.coverImg ||
    (movieDetail as any).coverimg ||
    (movieDetail as any).Coverimg;
  const coverUrl = getImageUrl(rawCover);
  const rawRating =
    movieDetail.avgRating ??
    (movieDetail as any).avgrating ??
    (movieDetail as any).Avgrating;
  const trailerUrl =
    movieDetail.episodes?.find((e) => e.videoType === 2)?.videoUrl || "";

  const handleWatchClick = (e: React.MouseEvent, episodeId?: number) => {
    if (movieDetail?.isPremium) {
      if (!isAuthenticated || !user?.isVip) {
        e.preventDefault();
        setShowVipModal(true);
        return;
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      {/* Hero Section */}
      <div className="relative w-full h-[85vh] sm:h-[90vh] lg:h-[100vh] flex items-end pb-12 sm:pb-24">
        {/* Blurred Backdrop */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={coverUrl}
            alt={movieDetail.title}
            className="w-full h-full object-cover object-top opacity-50 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/60 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-10">
          {/* Poster */}
          <div className="hidden md:block w-56 lg:w-72 shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 group">
            <img
              src={coverUrl}
              alt={movieDetail.title}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Info */}
          <div className="flex-1 w-full text-center md:text-left mt-20 md:mt-0">
            {movieDetail.isPremium && (
              <span className="inline-block bg-brand-gold text-black text-xs font-bold px-3 py-1 rounded-sm shadow-md mb-4 uppercase tracking-wider">
                👑 Phim VIP Premium
              </span>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg leading-tight uppercase">
              {movieDetail.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm md:text-base text-gray-300 mb-6 font-medium">
              {rawRating !== undefined && rawRating > 0 && (
                <span className="flex items-center gap-1.5 text-green-400">
                  <Star className="w-4 h-4 fill-green-400" />
                  {rawRating.toFixed(1)} Điểm
                </span>
              )}
              {rawRating !== undefined && rawRating > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
              )}

              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                {movieDetail.releaseDate?.substring(0, 4) || "N/A"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />

              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                {movieDetail.type === 1
                  ? "Phim Lẻ"
                  : `${movieDetail.episodes?.length || 0} Tập`}
              </span>
            </div>

            {movieDetail.genres && movieDetail.genres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-6">
                {movieDetail.genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-1.5 text-brand-red border border-brand-red/40 rounded-full text-sm font-medium bg-brand-red/5 backdrop-blur-md"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl mb-8 line-clamp-4 drop-shadow-md mx-auto md:mx-0">
              {movieDetail.description ||
                "Chưa có thông tin mô tả cho bộ phim này."}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
              <Link
                to={`/watch/${movieDetail.id}`}
                onClick={handleWatchClick}
                className="flex items-center justify-center gap-2 bg-brand-red text-white px-8 py-3 rounded font-bold text-base sm:text-lg hover:bg-[#C11119] transition-all duration-300 shadow-[0_0_15px_rgba(229,9,20,0.3)] hover:scale-105"
              >
                <Play className="w-5 h-5 fill-white" />
                {movieDetail.type === 2 ? "Xem Tập 1" : "Xem Phim"}
              </Link>

              {trailerUrl && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="flex items-center justify-center gap-2 bg-white/15 text-white border border-white/20 px-6 py-3 rounded font-semibold text-base sm:text-lg hover:bg-white/25 transition-all duration-300 backdrop-blur-md"
                >
                  <Film className="w-5 h-5" />
                  Trailer
                </button>
              )}

              <button
                onClick={toggleFavorite}
                className={`flex items-center justify-center gap-2 p-3.5 rounded transition-all duration-300 backdrop-blur-md border ${
                  isFavorite
                    ? "bg-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.3)] border-pink-500/50 group"
                    : "bg-white/10 hover:bg-white/20 border-white/20 group"
                }`}
                title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                <Heart
                  className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isFavorite ? "fill-pink-500 text-pink-500 scale-110" : "text-white"}`}
                />
              </button>

              <button
                className="flex items-center justify-center gap-2 p-3.5 rounded bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all duration-300 backdrop-blur-md group"
                title="Chia sẻ"
              >
                <Share2 className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-12" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rating & Review Banner */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 mt-8 md:mt-12 mb-4 relative z-20">
        <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-black/50">
          {/* Aggregate Rating */}
          <div className="flex items-center gap-6 md:gap-8 w-full md:w-auto justify-center md:justify-start">
            <div className="text-center">
              <h2 className="text-5xl md:text-6xl font-black text-brand-gold drop-shadow-md">
                {rawRating !== undefined && rawRating > 0
                  ? rawRating.toFixed(1)
                  : "-"}
              </h2>
              <p className="text-gray-400 font-medium tracking-widest mt-1">
                / 5
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-white leading-none">
                Đánh giá trung bình
              </h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 md:w-6 md:h-6 ${
                      (rawRating && rawRating >= star) ||
                      (rawRating && rawRating >= star - 0.5)
                        ? "text-brand-gold fill-brand-gold"
                        : "text-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Người dùng trên toàn hệ thống
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
          <div className="block md:hidden w-full h-px bg-white/10"></div>

          {/* User Rating Action */}
          <div className="flex flex-col items-center gap-3 w-full md:w-auto">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
              Đánh giá của bạn
            </h4>
            <div className="flex flex-col items-center group">
              <div
                className="flex items-center gap-2 md:gap-3"
                onMouseLeave={() => setHoveredStar(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onClick={async () => {
                      if (!isAuthenticated) {
                        alert("Vui lòng đăng nhập để đánh giá phim!");
                        return;
                      }
                      try {
                        await ratingService.upsert({
                          movieId: movieDetail.id,
                          score: star,
                        });
                        setUserRating(star);
                      } catch (error) {
                        console.error("Lỗi khi đánh giá:", error);
                        alert("Có lỗi xảy ra, vui lòng thử lại sau.");
                      }
                    }}
                    className="focus:outline-none transition-transform hover:scale-125 duration-300"
                    title={`${star} sao`}
                  >
                    <Star
                      className={`w-8 h-8 md:w-10 md:h-10 transition-colors duration-300 ${
                        (hoveredStar || userRating) >= star
                          ? "text-brand-gold fill-brand-gold drop-shadow-[0_0_8px_rgba(252,211,77,0.6)]"
                          : "text-zinc-600 hover:text-brand-gold/70"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-3 font-medium h-5">
                {userRating
                  ? `Bạn đã chấm ${userRating} sao. Cảm ơn bạn!`
                  : "Click vào các ngôi sao để đánh giá"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-12 md:space-y-16">
          {/* Cast */}
          {movieDetail.cast && movieDetail.cast.length > 0 && (
            <section>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-brand-red rounded-full"></span>
                Dàn Diễn Viên
              </h3>
              <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 custom-scrollbar snap-x">
                {movieDetail.cast.map((actor) => (
                  <div
                    key={actor.personId}
                    className="flex flex-col items-center min-w-[90px] md:min-w-[110px] snap-start group cursor-pointer"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:border-brand-red transition-colors duration-300">
                      <img
                        src={
                          getImageUrl(actor.avatar) ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${actor.fullName}`
                        }
                        alt={actor.fullName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-white text-sm font-medium text-center line-clamp-1 group-hover:text-brand-red transition-colors">
                      {actor.fullName}
                    </span>
                    <span className="text-gray-400 text-xs text-center line-clamp-1 mt-0.5">
                      {actor.roleName}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Đối với Phim Lẻ (movieDetail.type === 1) */}
          {movieDetail.type === 1 && movieDetail.episodes?.length > 0 && (
            <section className="space-y-6 md:space-y-8">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-brand-red rounded-full"></span>
                Nội dung & Video liên quan
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {/* Cột 1: Trailer & Teaser */}
                <div className="space-y-4">
                  <h4 className="text-base md:text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                    <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                    Trailer & Teaser
                  </h4>
                  {movieDetail.episodes.filter((ep) => ep.videoType === 2)
                    .length === 0 ? (
                    <div className="bg-white/5 rounded-lg p-6 text-center border border-white/5">
                      <p className="text-sm text-zinc-500 italic">
                        Chưa có Trailer/Teaser nào cho phim này.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {movieDetail.episodes
                        .filter((ep) => ep.videoType === 2)
                        .map((ep) => (
                          <div
                            key={ep.id}
                            onClick={() => setIsTrailerOpen(true)}
                            className="flex gap-4 bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors duration-300 group cursor-pointer border border-transparent hover:border-white/10"
                          >
                            <div className="w-32 aspect-video rounded-md overflow-hidden relative shrink-0 shadow-md">
                              <img
                                src={coverUrl}
                                alt={ep.episodeTitle || "Trailer"}
                                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-8 h-8 rounded-full bg-brand-red/90 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col justify-center">
                              <h5 className="text-white font-bold text-sm line-clamp-2 leading-snug group-hover:text-brand-red transition-colors duration-300">
                                {ep.episodeTitle || "Trailer chính thức"}
                              </h5>
                              <span className="text-zinc-500 text-xs mt-1.5 font-medium">
                                {ep.duration || "N/A"}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Cột 2: Tập Phim Chính Thức */}
                <div className="space-y-4">
                  <h4 className="text-base md:text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Tập Phim Chính Thức
                  </h4>
                  {movieDetail.episodes.filter((ep) => ep.videoType === 1)
                    .length === 0 ? (
                    <div className="bg-white/5 rounded-lg p-6 text-center border border-white/5">
                      <p className="text-sm text-zinc-500 italic">
                        Chưa có tập phim chính thức nào được đăng tải.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {movieDetail.episodes
                        .filter((ep) => ep.videoType === 1)
                        .map((ep) => (
                          <Link
                            key={ep.id}
                            to={`/watch/${movieDetail.id}?episode=${ep.id}`}
                            onClick={handleWatchClick}
                            className="flex gap-4 bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors duration-300 group border border-transparent hover:border-green-500/30"
                          >
                            <div className="w-32 aspect-video rounded-md overflow-hidden relative shrink-0 shadow-md">
                              <img
                                src={coverUrl}
                                alt={ep.episodeTitle || "Tập chính thức"}
                                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center transform group-hover:bg-white transition-all duration-300 group-hover:scale-110">
                                  <Play className="w-4 h-4 fill-white text-white ml-0.5 group-hover:text-black group-hover:fill-black transition-colors" />
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col justify-center">
                              <h5 className="text-white font-bold text-sm line-clamp-2 leading-snug group-hover:text-green-400 transition-colors duration-300">
                                {ep.episodeTitle || `Tập ${ep.episodeNumber}`}
                              </h5>
                              <span className="text-zinc-500 text-xs mt-1.5 font-medium">
                                {ep.duration || "N/A"}
                              </span>
                            </div>
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Episodes List (if TV Show) */}
          {movieDetail.type === 2 && movieDetail.episodes?.length > 0 && (
            <section>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-brand-red rounded-full"></span>
                Danh sách Tập phim
              </h3>

              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {movieDetail.episodes
                  .filter((ep) => ep.videoType === 1)
                  .map((ep) => (
                    <Link
                      key={ep.id}
                      to={`/watch/${movieDetail.id}?episode=${ep.id}`}
                      onClick={handleWatchClick}
                      className="flex flex-row gap-4 bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-all duration-300 group border border-transparent hover:border-white/10 relative overflow-hidden"
                    >
                      <div className="w-32 sm:w-40 aspect-video rounded-lg overflow-hidden relative shrink-0 shadow-md">
                        <img
                          src={coverUrl}
                          alt={ep.episodeTitle || `Tập ${ep.episodeNumber}`}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center transform group-hover:bg-brand-red group-hover:border-brand-red transition-all duration-300 group-hover:scale-110 shadow-lg">
                            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center py-1 md:py-2 z-10">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                            Tập {ep.episodeNumber}
                          </span>
                        </div>
                        <h4 className="text-white font-bold text-sm md:text-base mb-1 line-clamp-1 group-hover:text-brand-red transition-colors">
                          {ep.episodeTitle || `Tập ${ep.episodeNumber}`}
                        </h4>
                        <p className="text-gray-400 text-xs font-medium">
                          {ep.duration || "N/A"}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6 lg:space-y-8 sticky top-[100px] self-start">
          <div className="bg-neutral-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl">
            <h4 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Film className="w-5 h-5 text-brand-red" />
              Thông tin thêm
            </h4>

            <div className="space-y-4 md:space-y-5 text-sm">
              <div className="flex items-start justify-between border-b border-white/5 pb-3 md:pb-4">
                <span className="text-gray-400 font-medium">Hãng sản xuất</span>
                <span className="text-white font-semibold text-right">
                  {movieDetail.studioName || "Đang cập nhật"}
                </span>
              </div>
              <div className="flex items-start justify-between border-b border-white/5 pb-3 md:pb-4">
                <span className="text-gray-400 font-medium">Khởi chiếu</span>
                <span className="text-white font-semibold text-right">
                  {movieDetail.releaseDate?.substring(0, 4) || "N/A"}
                </span>
              </div>
              <div className="flex items-start justify-between border-b border-white/5 pb-3 md:pb-4">
                <span className="text-gray-400 font-medium">Thể loại</span>
                <span className="text-white font-semibold text-right max-w-[150px] leading-snug">
                  {movieDetail.genres?.join(", ") || "N/A"}
                </span>
              </div>
              <div className="flex items-start justify-between border-b border-white/5 pb-3 md:pb-4">
                <span className="text-gray-400 font-medium">Loại phim</span>
                <span className="text-white font-semibold text-right">
                  {movieDetail.type === 1 ? "Phim Lẻ" : "Phim Bộ"}
                </span>
              </div>
              <div className="flex items-start justify-between pt-1">
                <span className="text-gray-400 font-medium">Trạng thái</span>
                <span className="text-white font-semibold text-right">
                  {movieDetail.isPremium ? (
                    <span className="bg-brand-gold text-black text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                      👑 VIP PREMIUM
                    </span>
                  ) : (
                    <span className="bg-white/10 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded border border-white/20">
                      MIỄN PHÍ
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        videoUrl={trailerUrl || "https://www.youtube.com/watch?v=yQEondeGvKo"}
      />

      {/* VIP Required Modal */}
      {showVipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowVipModal(false)}
          />
          <div className="bg-zinc-900 border border-white/10 p-6 md:p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative z-10 transform scale-100 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowVipModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-brand-gold/20">
              <span className="text-3xl">👑</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-3 tracking-wide">
              ĐẶC QUYỀN VIP
            </h2>
            <p className="text-gray-300 mb-8 leading-relaxed text-sm md:text-base">
              Bộ phim bạn muốn xem yêu cầu tài khoản{" "}
              <span className="text-brand-gold font-bold">Premium</span>. Hãy
              nâng cấp ngay để mở khóa kho phim chất lượng cao không giới hạn!
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/goi-vip"
                className="w-full bg-brand-gold text-black py-3.5 rounded-lg font-bold text-base hover:bg-yellow-500 transition-colors shadow-[0_0_15px_rgba(252,211,77,0.3)] shadow-brand-gold/20"
              >
                Nâng cấp VIP ngay
              </Link>
              <button
                onClick={() => setShowVipModal(false)}
                className="w-full py-3 text-gray-400 font-medium hover:text-white transition-colors"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
