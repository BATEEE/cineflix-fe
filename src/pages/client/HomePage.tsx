import React, { useEffect, useState } from "react";
import { HeroBanner } from "@/components/HeroBanner";
import { MovieRow } from "@/components/MovieRow";
import movieService, { type MovieDto } from "@/services/movieService";
import watchHistoryService, {
  type WatchHistoryItem,
} from "@/services/watchHistoryService";
import { useAuthStore } from "@/stores/authStore";

export const HomePage = () => {
  const [hotMovies, setHotMovies] = useState<MovieDto[]>([]);
  const [newMovies, setNewMovies] = useState<MovieDto[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MovieDto[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Fetch dữ liệu trang chủ
    movieService
      .getHomeFeed()
      .then((feed) => {
        setHotMovies(feed.hotMovies);
        setNewMovies(feed.newMovies);
        setTopRatedMovies(feed.topRatedMovies);
      })
      .catch(console.error);

    // Fetch lịch sử xem nếu đã đăng nhập
    if (isAuthenticated) {
      watchHistoryService.getHistory().then(setHistory).catch(console.error);
    }
  }, [isAuthenticated]);

  // Helper xử lý link ảnh: Nếu là chuỗi rỗng -> ảnh mặc định, nếu là path tương đối -> nối với backend URL
  const getImageUrl = (url?: string) => {
    if (!url || url.trim() === "") {
      return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop";
    }
    if (url.startsWith("http")) return url;
    return `http://localhost:5063${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // Convert sang format mà MovieRow cần
  const mapToRowItem = (m: any) => {
    // API C# có thể trả về thuộc tính coverImg, coverimg tuỳ vào serializer
    const cover = m.coverImg || m.coverimg || m.Coverimg;
    const rating = m.avgRating ?? m.avgrating ?? m.Avgrating;
    return {
      id: m.id,
      title: m.title,
      posterPath: getImageUrl(cover),
      isPremium: m.isPremium,
      avgRating: rating,
      genres: m.genres,
      typeText: m.type === 1 ? "Phim lẻ" : m.type === 2 ? "Phim bộ" : undefined,
    };
  };

  const hotMoviesRow = hotMovies.map(mapToRowItem);
  const newMoviesRow = newMovies.map(mapToRowItem);
  const topRatedMoviesRow = topRatedMovies.map(mapToRowItem);

  // Chọn bộ phim đầu tiên ở danh sách nổi bật làm Hero Banner
  const featuredMovie =
    hotMoviesRow.length > 0
      ? {
          id: hotMoviesRow[0].id,
          title: hotMoviesRow[0].title,
          backdropPath: hotMoviesRow[0].posterPath, // Dùng cover img làm backdrop tạm, nếu API có trường banner riêng thì cập nhật sau
          rating: hotMoviesRow[0].avgRating,
          genres: hotMoviesRow[0].genres,
        }
      : null;

  // Group history theo movieId, chỉ giữ lại tập mới nhất được xem (dựa trên lastWatchedAt)
  const groupedHistory = history.reduce<Record<number, WatchHistoryItem>>(
    (acc, item) => {
      const existing = acc[item.movieId];
      if (
        !existing ||
        new Date(item.lastWatchedAt) > new Date(existing.lastWatchedAt)
      ) {
        acc[item.movieId] = item;
      }
      return acc;
    },
    {},
  );

  const latestHistoryItems = Object.values(groupedHistory).sort(
    (a, b) =>
      new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime(),
  );

  const historyMovies = latestHistoryItems.map((h: any) => {
    const cover = h.movieCoverImg || h.movieCoverimg || h.MovieCoverimg;
    return {
      id: h.movieId,
      title: h.episodeTitle
        ? `${h.movieTitle} - ${h.episodeTitle}`
        : `${h.movieTitle} - Tập ${h.episodeNumber}`,
      posterPath: getImageUrl(cover),
      isPremium: false,
      progress: 60, // Hiển thị progress bar xem dở
      targetUrl: `/watch/${h.movieId}?episode=${h.episodeId}`, // Chuyển hướng trực tiếp đến tập đang xem
    };
  });

  return (
    <div className="pb-16 bg-brand-bg min-h-screen">
      <HeroBanner movie={featuredMovie} />

      {/* Container for rows to overlap the HeroBanner slightly */}
      <div className="-mt-16 sm:-mt-24 lg:-mt-32 relative z-20 space-y-2">
        {isAuthenticated && historyMovies.length > 0 && (
          <MovieRow
            title="Tiếp Tục Xem"
            movies={historyMovies}
            isContinueWatching={true}
          />
        )}
        <MovieRow title="Phim Nổi Bật" movies={hotMoviesRow} />
        <MovieRow title="Mới Cập Nhật" movies={newMoviesRow} />
        <MovieRow title="Đánh Giá Cao" movies={topRatedMoviesRow} />
      </div>
    </div>
  );
};
