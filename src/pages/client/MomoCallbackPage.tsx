import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, ShieldCheck, Zap, Star } from "lucide-react";
import vipPackageService from "@/services/vipPackageService";
import { useAuthStore } from "@/stores/authStore";

type VerificationStatus = "verifying" | "success" | "failed";

export const MomoCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setVip } = useAuthStore();
  
  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [pkgName, setPkgName] = useState<string>("Gói VIP");
  const [duration, setDuration] = useState<number>(0);
  const [amount, setAmount] = useState<string>("");

  const orderId = searchParams.get("orderId");
  const resultCode = searchParams.get("resultCode");
  const urlMessage = searchParams.get("message") || "";

  useEffect(() => {
    if (!orderId || resultCode === null) {
      setStatus("failed");
      setErrorMessage("Không tìm thấy thông tin giao dịch MoMo hợp lệ.");
      return;
    }

    // Nếu người dùng hủy thanh toán (resultCode khác "0")
    if (resultCode !== "0") {
      setStatus("failed");
      setErrorMessage(
        urlMessage || "Giao dịch đã bị hủy hoặc thất bại từ phía MoMo."
      );
      return;
    }

    // Nếu resultCode === "0", gọi backend confirm giao dịch thực tế
    const verifyTransaction = async () => {
      try {
        const response = await vipPackageService.confirmMomo(orderId, resultCode);
        
        if (response.success) {
          // Lưu thông tin gói mua được trả về từ Backend để hiển thị
          if (response.data) {
            setPkgName(response.data.packageName || "Gói VIP");
            setDuration(response.data.durationMonths || 1);
            setAmount(
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(response.data.amount || 0)
            );
          }
          
          // Cập nhật trạng thái VIP trong store của Client
          setVip();
          setStatus("success");
          toast.success("Thanh toán qua ví MoMo thành công!");
        } else {
          setStatus("failed");
          setErrorMessage(response.message || "Xác thực giao dịch MoMo không thành công.");
        }
      } catch (err: any) {
        console.error("Error verifying Momo payment:", err);
        setStatus("failed");
        setErrorMessage("Đã xảy ra lỗi hệ thống trong quá trình xác thực thanh toán.");
      }
    };

    verifyTransaction();
  }, [orderId, resultCode, urlMessage, setVip]);

  return (
    <div
      className="min-h-screen bg-brand-bg flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(circle at center, #1b1b3a 0%, #111122 60%, #080811 100%)",
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-brand-gold/20 shadow-2xl p-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #141426, #0e0e1a)",
        }}
      >
        {/* Glow effect top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-brand-gold/30 blur-md rounded-full" />

        {/* ── TRẠNG THÁI 1: ĐANG XÁC THỰC ── */}
        {status === "verifying" && (
          <div className="flex flex-col items-center text-center gap-6 py-6 animate-pulse">
            <div className="relative">
              <Loader2 size={64} className="text-brand-gold animate-spin" />
              <div className="absolute inset-0 bg-brand-gold/10 rounded-full blur-xl" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Đang xác thực giao dịch...
              </h2>
              <p className="text-gray-400 text-sm max-w-sm">
                Hệ thống đang đồng bộ và xác minh thông tin thanh toán với ví MoMo Sandbox. Vui lòng chờ trong giây lát.
              </p>
            </div>

            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-brand-gold rounded-full"
                style={{
                  width: "60%",
                  animation: "loading-bar 2s infinite ease-in-out",
                }}
              />
            </div>
          </div>
        )}

        {/* ── TRẠNG THÁI 2: THÀNH CÔNG RỰC RỠ ── */}
        {status === "success" && (
          <div className="flex flex-col items-center text-center gap-6 py-4">
            {/* Animated Ring Checkmark */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)",
                animation: "pulse-green 2s infinite",
              }}
            >
              <CheckCircle size={56} className="text-green-400" />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                Nâng Cấp VIP Thành Công!
              </h2>
              <p className="text-gray-300 text-sm">
                Chào mừng bạn đã trở thành thành viên đẳng cấp của{" "}
                <span className="text-brand-gold font-bold">CineFlix VIP</span>
              </p>
            </div>

            {/* Receipt Box */}
            <div className="w-full bg-white/5 rounded-xl border border-white/10 p-5 text-sm space-y-3.5 text-left mt-2">
              <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                <span className="text-gray-400">Gói dịch vụ</span>
                <span className="font-bold text-brand-gold text-base">{pkgName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Thời hạn</span>
                <span className="font-semibold text-white">{duration} tháng</span>
              </div>
              {amount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Số tiền thanh toán</span>
                  <span className="font-bold text-white">{amount}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Kênh thanh toán</span>
                <span className="font-medium text-[#D82D8B] flex items-center gap-1">
                  Ví MoMo Sandbox
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-normal">Mã giao dịch</span>
                <span className="font-mono text-xs text-gray-300 truncate max-w-[200px]" title={orderId || ""}>
                  {orderId}
                </span>
              </div>
            </div>

            {/* Perks mini list */}
            <div className="flex justify-around w-full gap-2 text-xs text-gray-400 my-1 bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="flex items-center gap-1 text-green-400/90">
                <ShieldCheck size={12} /> Xem 4K
              </span>
              <span className="flex items-center gap-1 text-green-400/90">
                <Zap size={12} /> Không QC
              </span>
              <span className="flex items-center gap-1 text-green-400/90">
                <Star size={12} /> Full Kho
              </span>
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full py-3.5 rounded-xl font-bold text-black text-sm tracking-wide transition-transform hover:scale-[1.01]"
              style={{
                background: "linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)",
                boxShadow: "0 4px 20px rgba(255,193,7,0.3)",
              }}
            >
              Bắt đầu trải nghiệm ngay
            </button>
          </div>
        )}

        {/* ── TRẠNG THÁI 3: GIAO DỊCH THẤT BẠI ── */}
        {status === "failed" && (
          <div className="flex flex-col items-center text-center gap-6 py-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)",
              }}
            >
              <XCircle size={56} className="text-red-500" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Giao Dịch Thất Bại
              </h2>
              <p className="text-red-400/90 text-sm max-w-sm bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-lg">
                {errorMessage || "Thanh toán chưa hoàn tất hoặc bị từ chối."}
              </p>
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={() => navigate("/vip")}
                className="w-full py-3 rounded-xl font-bold text-white text-sm tracking-wide transition-colors bg-white/10 hover:bg-white/15 border border-white/15"
              >
                Quay lại trang Gói VIP
              </button>
              
              <button
                onClick={() => navigate("/")}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-400 transition-colors"
              >
                Trở về Trang chủ
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(34,197,94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94, 0); }
        }
      `}</style>
    </div>
  );
};
