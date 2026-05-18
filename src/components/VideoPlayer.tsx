import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { Loader2 } from 'lucide-react';

export interface VideoPlayerProps {
  videoUrl: string;
  /**
   * playerRef nhận HTMLVideoElement theo react-player v3 API.
   * Dùng để seek: playerRef.current.currentTime = seconds
   */
  playerRef?: React.RefCallback<HTMLVideoElement>;
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onReady?: () => void;
}

/**
 * Cineflix Premium Video Player — react-player v3 edition
 *
 * BREAKING CHANGES v2 → v3 (đã áp dụng đúng):
 * - `url`          → `src`
 * - `onProgress`   → `onTimeUpdate`  (HTMLMediaElement event)
 * - `onBuffer`     → `onWaiting`     (HTMLMediaElement event)
 * - `onBufferEnd`  → `onPlaying`     (HTMLMediaElement event)
 * - ref nhận HTMLVideoElement, không phải ReactPlayer instance
 *
 * playing không được truyền vào — để người dùng tự bấm ▶ trên controls.
 * Tuân thủ browser Autoplay Policy.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  playerRef,
  onTimeUpdate,
  onReady,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80">

      <ReactPlayer
        ref={playerRef}
        src={videoUrl}           // v3: `src` thay cho `url`
        width="100%"
        height="100%"
        controls={true}
        style={{ position: 'absolute', top: 0, left: 0 }}

        // v3 events — đặt TRỰC TIẾP vào <ReactPlayer>, không phải div wrapper
        onReady={() => {
          setIsLoading(false);
          if (onReady) onReady();
        }}
        onTimeUpdate={onTimeUpdate}  // v3: thay cho onProgress
        onWaiting={() => setIsBuffering(true)}   // v3: thay cho onBuffer
        onPlaying={() => setIsBuffering(false)}  // v3: thay cho onBufferEnd

        config={{
          youtube: {
            color: 'white', // Màu thanh progress bar YouTube
          }
        }}
      />

      {/* Spinner Overlay */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm z-10 pointer-events-none">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
            <Loader2 className="w-7 h-7 text-red-500 animate-pulse" />
          </div>
          <span className="mt-5 text-xs font-semibold tracking-widest text-zinc-500 uppercase animate-pulse">
            {isLoading ? 'Đang chuẩn bị phòng chiếu...' : 'Đang tải dữ liệu...'}
          </span>
        </div>
      )}
    </div>
  );
};
