import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Send, ThumbsUp, AlertCircle, X, ArrowLeft } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useAuthStore } from "@/stores/authStore";
import movieService, { type MovieDetail } from "@/services/movieService";
import watchHistoryService from "@/services/watchHistoryService";
import commentService, { type CommentItem } from "@/services/commentService";

export const WatchPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const episodeIdParam = searchParams.get("episode");
  const { user, isAuthenticated } = useAuthStore();

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [savedProgress, setSavedProgress] = useState(0);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // v3: ref nhận HTMLVideoElement trực tiếp
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const setPlayerRef = useCallback((el: HTMLVideoElement) => {
    playerRef.current = el;
  }, []);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoggedViewRef = useRef<boolean>(false);
  const lastPrintedTimeRef = useRef<number>(0);

  // Fetch movie data and comments
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [movieData, commentsData] = await Promise.all([
          movieService.getById(Number(id)),
          commentService.getByMovieId(Number(id)),
        ]);
        setMovie(movieData);
        setComments(commentsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Determine current episode
  const currentEpisode =
    movie?.episodes?.find((ep) => ep.id.toString() === episodeIdParam) ||
    (movie?.episodes?.length ? movie.episodes[0] : null);

  // Fetch progress when episode changes
  useEffect(() => {
    if (!currentEpisode || !isAuthenticated) {
      setPlaying(true);
      return;
    }

    const fetchProgress = async () => {
      try {
        const progress = await watchHistoryService.getProgress(
          currentEpisode.id,
        );
        if (progress && progress.stoppedAtSeconds > 5) {
          setSavedProgress(progress.stoppedAtSeconds);
          setShowContinuePrompt(true);
          setPlaying(false);
        } else {
          setPlaying(true);
        }
      } catch (err) {
        console.error("Lỗi lấy tiến trình:", err);
        setPlaying(true);
      }
    };
    fetchProgress();
  }, [currentEpisode, isAuthenticated]);

  // Reset trạng thái log view khi đổi tập phim
  useEffect(() => {
    hasLoggedViewRef.current = false;
    lastPrintedTimeRef.current = 0;
  }, [currentEpisode?.id]);

  const handleContinue = () => {
    // v3: dùng HTMLVideoElement.currentTime thay cho seekTo()
    if (playerRef.current) playerRef.current.currentTime = savedProgress;
    setShowContinuePrompt(false);
  };

  const handleRestart = () => {
    if (playerRef.current) playerRef.current.currentTime = 0;
    setShowContinuePrompt(false);
  };

  // v3: onTimeUpdate thay cho onProgress — nhận SyntheticEvent<HTMLVideoElement>
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!currentEpisode) return;
    const currentTime = e.currentTarget.currentTime;

    // Chỉ ghi nhận view khi xem tối thiểu 10s và chưa được log cho tập này
    if (currentTime >= 10 && !hasLoggedViewRef.current) {
      hasLoggedViewRef.current = true;
      watchHistoryService
        .logView(movie?.id || 0, currentEpisode.id)
        .catch((err) => console.error("Lỗi ghi nhận view_logs:", err));
    }

    // In ra console thời gian đã xem mỗi 0.5s
    if (Math.abs(currentTime - lastPrintedTimeRef.current) >= 0.5) {
      console.log(
        `[Cineflix Player] Thời gian phát: ${currentTime.toFixed(1)}s / Yêu cầu tính view: 10s`,
      );
      lastPrintedTimeRef.current = currentTime;
    }

    if (!isAuthenticated) return;

    // Throttle save progress mỗi 10 giây
    if (progressTimerRef.current) return;
    progressTimerRef.current = setTimeout(() => {
      watchHistoryService
        .saveProgress(currentEpisode.id, Math.floor(currentTime))
        .catch(console.error);
      progressTimerRef.current = null;
    }, 10000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    };
  }, []);

  const getImageUrl = (url?: string | null) => {
    if (!url || url.trim() === "") {
      return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop";
    }
    if (url.startsWith("http")) return url;
    return `http://localhost:5063${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !movie) return;

    try {
      const response = await commentService.create(movie.id, newComment);
      if (response.success) {
        // Refresh comments
        const updatedComments = await commentService.getByMovieId(movie.id);
        setComments(updatedComments);
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đăng bình luận.");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading)
    return <div className="p-20 text-white text-center">Đang tải...</div>;
  if (!movie || !currentEpisode)
    return (
      <div className="p-20 text-white text-center">
        Không tìm thấy tập phim.
      </div>
    );

  const videoUrlRaw =
    (currentEpisode as any).videoUrl ||
    (currentEpisode as any).videourl ||
    (currentEpisode as any).VideoUrl ||
    "";
  const videoUrl = videoUrlRaw
    ? getImageUrl(videoUrlRaw)
    : "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4";

  if (movie.isPremium && currentEpisode.videoType !== 2 && (!isAuthenticated || !user?.isVip)) {
    return (
      <div className="min-h-screen bg-brand-bg pt-[68px] flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-lg text-center shadow-2xl">
          <AlertCircle className="w-16 h-16 text-brand-gold mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">
            👑 Phim VIP Premium
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Bạn cần nâng cấp tài khoản lên VIP để xem bộ phim này. Hãy trải
            nghiệm chất lượng tuyệt đỉnh không giới hạn nhé!
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-brand-gold text-black px-8 py-3 rounded-md font-bold text-lg hover:bg-yellow-500 transition-colors shadow-lg"
          >
            Trở về
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pt-[68px]">
      <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row">
        {/* Main Player Area */}
        <div className="flex-1 lg:border-r border-gray-800">
          <div className="relative">
            <VideoPlayer
              playerRef={setPlayerRef}
              videoUrl={videoUrl}
              onTimeUpdate={handleTimeUpdate}
            />

            {/* Continue Watching Prompt Overlay */}
            {showContinuePrompt && (
              <div className="absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 max-w-md w-full mx-4 shadow-2xl relative">
                  <button
                    onClick={handleRestart}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <AlertCircle className="w-12 h-12 text-brand-red mb-4 mx-auto" />
                  <h3 className="text-xl font-bold text-white text-center mb-2">
                    Tiếp tục xem?
                  </h3>
                  <p className="text-gray-400 text-center mb-6">
                    Bạn đang xem dở ở {formatTime(savedProgress)}. Bạn có muốn
                    tiếp tục xem từ vị trí này không?
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleRestart}
                      className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Xem từ đầu
                    </button>
                    <button
                      onClick={handleContinue}
                      className="flex-1 py-3 bg-brand-red hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                    >
                      Tiếp tục xem
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <Link
              to={`/movie/${movie.id}`}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-brand-red mb-6 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại chi tiết phim
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {movie.title}
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              {currentEpisode.episodeTitle ||
                `Tập ${currentEpisode.episodeNumber}`}
            </p>

            {/* Comment Section */}
            <div className="mt-8 border-t border-gray-800 pt-8">
              <h3 className="text-xl font-bold text-white mb-6">
                Bình luận ({comments.length})
              </h3>

              {isAuthenticated ? (
                <form onSubmit={handlePostComment} className="flex gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-gray-800 shrink-0 overflow-hidden">
                    <img
                      src={
                        user?.avt ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`
                      }
                      alt="My Avatar"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Thêm bình luận..."
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-gray-500 pr-12"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-brand-red disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-900 p-4 rounded-lg mb-8 text-center border border-gray-800">
                  <p className="text-gray-400 mb-2">
                    Vui lòng đăng nhập để tham gia bình luận.
                  </p>
                  <Link
                    to="/login"
                    className="text-brand-red hover:underline font-medium"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              )}

              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-800 shrink-0 overflow-hidden">
                      <img
                        src={
                          comment.userAvt ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userDisplayName}`
                        }
                        alt={comment.userDisplayName}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">
                          {comment.userDisplayName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.commentDate).toLocaleString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                      <p className="text-gray-300 text-[15px] mb-2">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="hover:text-white transition-colors">
                          Phản hồi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Episodes (for TV Shows) */}
        {movie.type === 2 && movie.episodes && movie.episodes.length > 0 && (
          <div className="w-full lg:w-96 shrink-0 bg-brand-bg flex flex-col border-t lg:border-t-0 lg:border-l border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white">Danh sách tập</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar lg:max-h-[calc(100vh-68px)]">
              {movie.episodes.map((ep) => {
                const isActive = currentEpisode.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setSearchParams({ episode: ep.id.toString() });
                      setPlaying(false);
                      setShowContinuePrompt(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                      isActive
                        ? "bg-gray-800"
                        : "hover:bg-gray-900/50 hover:bg-white/5"
                    }`}
                  >
                    <div className="relative w-28 md:w-32 aspect-video bg-gray-800 rounded overflow-hidden shrink-0 shadow-md">
                      <img
                        src={getImageUrl(
                          movie.coverImg ||
                            (movie as any).coverimg ||
                            (movie as any).Coverimg,
                        )}
                        alt={ep.episodeTitle || "Tập phim"}
                        className="w-full h-full object-cover opacity-70 transition-opacity hover:opacity-100"
                      />
                      {isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="text-[10px] font-bold text-white bg-brand-red px-2 py-0.5 rounded shadow">
                            Đang phát
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h4
                        className={`text-sm font-bold truncate ${isActive ? "text-brand-red" : "text-gray-200"}`}
                      >
                        {ep.episodeTitle || `Tập ${ep.episodeNumber}`}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        {ep.duration || "N/A"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
