import React, { useEffect, useRef, useState } from "react";
import { CheckCircle, X, Copy, Clock, QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { VipPackage } from "@/services/vipPackageService";

const { VITE_BANK_ID, VITE_BANK_ACCOUNT_NO, VITE_BANK_ACCOUNT_NAME } =
  import.meta.env;

const BANK_CONFIG = {
  bankId: VITE_BANK_ID as string,
  accountNo: VITE_BANK_ACCOUNT_NO as string,
  accountName: VITE_BANK_ACCOUNT_NAME as string,
};

type Step = "qr" | "processing" | "success";

interface Props {
  pkg: VipPackage;
  onClose: () => void;
  onSuccess: () => void;
}

export const VietQRPaymentModal: React.FC<Props> = ({
  pkg,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<Step>("qr");
  const [countdown, setCountdown] = useState(5);
  const overlayRef = useRef<HTMLDivElement>(null);

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(pkg.price);

  const transferContent = `CINEFLIX VIP ${pkg.packageName.toUpperCase().replace(/\s+/g, "")}`;

  const qrUrl =
    `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact2.png` +
    `?amount=${pkg.price}` +
    `&addInfo=${encodeURIComponent(transferContent)}` +
    `&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

  // Countdown khi đang xử lý
  useEffect(() => {
    if (step !== "processing") return;
    if (countdown <= 0) {
      onSuccess();
      setStep("success");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown, onSuccess]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`Đã sao chép ${label}`);
    });
  };

  const handlePaid = () => {
    setStep("processing");
    setCountdown(5);
  };

  // Click ngoài modal để đóng (chỉ ở bước qr)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (step === "qr" && e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-brand-gold/30 shadow-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          animation: "slideUp 0.3s ease",
        }}
      >
        {/* ── Nút đóng ── */}
        {step === "qr" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>
        )}

        {/* ── BƯỚC 1: Hiện QR ── */}
        {step === "qr" && (
          <div className="p-6 flex flex-col items-center gap-4">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-brand-gold mb-1">
                <QrCode size={18} />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Thanh toán VietQR
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {pkg.packageName}
              </h2>
              <p className="text-3xl font-black text-brand-gold mt-1">
                {formattedPrice}
              </p>
            </div>

            {/* QR Code */}
            <div className="relative p-2 bg-white rounded-xl shadow-lg shadow-brand-gold/20">
              <img
                src={qrUrl}
                alt="VietQR Payment Code"
                className="w-52 h-52 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://api.qrserver.com/v1/create-qr-code/?size=208x208&data=${encodeURIComponent(
                      `STK: ${BANK_CONFIG.accountNo} - ${BANK_CONFIG.bankId} - ${formattedPrice} - ${transferContent}`,
                    )}`;
                }}
              />
            </div>

            {/* Thông tin chuyển khoản */}
            <div className="w-full space-y-2 text-sm">
              <InfoRow
                label="Ngân hàng"
                value={BANK_CONFIG.bankId}
                onCopy={() => handleCopy(BANK_CONFIG.bankId, "ngân hàng")}
              />
              <InfoRow
                label="Số tài khoản"
                value={BANK_CONFIG.accountNo}
                onCopy={() => handleCopy(BANK_CONFIG.accountNo, "số tài khoản")}
              />
              <InfoRow
                label="Số tiền"
                value={formattedPrice}
                onCopy={() => handleCopy(String(pkg.price), "số tiền")}
              />
              <InfoRow
                label="Nội dung"
                value={transferContent}
                onCopy={() => handleCopy(transferContent, "nội dung")}
                highlight
              />
            </div>

            {/* Ghi chú */}
            <p className="text-xs text-yellow-400/80 text-center bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
              ⚠️ Nhập đúng nội dung chuyển khoản để hệ thống tự nhận diện
            </p>

            {/* Nút xác nhận */}
            <button
              onClick={handlePaid}
              className="w-full py-3 rounded-xl font-bold text-black text-sm tracking-wide transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)",
                boxShadow: "0 0 20px rgba(255,193,7,0.4)",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.transform = "scale(1.02)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.transform = "scale(1)")
              }
            >
              ✅ Tôi đã thanh toán
            </button>
          </div>
        )}

        {/* ── BƯỚC 2: Đang xử lý ── */}
        {step === "processing" && (
          <div className="p-10 flex flex-col items-center gap-6 text-center">
            <div className="relative">
              <Loader2 size={64} className="text-brand-gold animate-spin" />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,193,7,0.15) 0%, transparent 70%)",
                }}
              />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Đang xác nhận giao dịch...
              </h3>
              <p className="text-gray-400 text-sm">
                Vui lòng không đóng cửa sổ này
              </p>
            </div>

            {/* Vòng đếm ngược */}
            <div className="flex items-center gap-2 text-brand-gold">
              <Clock size={16} />
              <span className="text-lg font-bold tabular-nums">
                {countdown}s
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-gold rounded-full transition-all duration-1000"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── BƯỚC 3: Thành công ── */}
        {step === "success" && (
          <div className="p-10 flex flex-col items-center gap-5 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)",
                animation: "pulse 1.5s infinite",
              }}
            >
              <CheckCircle size={52} className="text-green-400" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                🎉 Thanh toán thành công!
              </h3>
              <p className="text-gray-300 text-sm">
                Bạn đã kích hoạt gói{" "}
                <span className="text-brand-gold font-semibold">
                  {pkg.packageName}
                </span>
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Thời hạn: {pkg.durationMonths} tháng
              </p>
            </div>

            <div className="w-full space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 rounded-lg px-4 py-2">
                <span className="text-green-400">✓</span> Mở khóa tất cả phim
                VIP
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 rounded-lg px-4 py-2">
                <span className="text-green-400">✓</span> Chất lượng 4K / Full
                HD
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 rounded-lg px-4 py-2">
                <span className="text-green-400">✓</span> Không quảng cáo
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-black text-sm tracking-wide"
              style={{
                background: "linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)",
                boxShadow: "0 0 20px rgba(255,193,7,0.4)",
              }}
            >
              Bắt đầu xem phim ngay →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ── Sub-component: hàng thông tin ──────────────────────────────────────
const InfoRow: React.FC<{
  label: string;
  value: string;
  onCopy: () => void;
  highlight?: boolean;
}> = ({ label, value, onCopy, highlight }) => (
  <div
    className={`flex items-center justify-between rounded-lg px-3 py-2 ${
      highlight ? "bg-brand-gold/10 border border-brand-gold/30" : "bg-white/5"
    }`}
  >
    <span className="text-gray-400">{label}</span>
    <div className="flex items-center gap-2">
      <span
        className={`font-semibold ${highlight ? "text-brand-gold" : "text-white"}`}
      >
        {value}
      </span>
      <button
        onClick={onCopy}
        className="text-gray-500 hover:text-brand-gold transition-colors"
      >
        <Copy size={13} />
      </button>
    </div>
  </div>
);
