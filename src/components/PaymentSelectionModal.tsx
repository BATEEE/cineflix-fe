import React, { useRef } from "react";
import { X, CreditCard, QrCode } from "lucide-react";
import type { VipPackage } from "@/services/vipPackageService";

interface Props {
  pkg: VipPackage;
  onClose: () => void;
  onSelect: (method: "vietqr" | "momo") => void;
}

export const PaymentSelectionModal: React.FC<Props> = ({
  pkg,
  onClose,
  onSelect,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(pkg.price);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
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
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-1">
              Chọn phương thức thanh toán
            </h2>
            <p className="text-sm text-gray-400">
              Để mua gói VIP{" "}
              <span className="text-brand-gold font-semibold">
                {pkg.packageName}
              </span>{" "}
              ({pkg.durationMonths} tháng)
            </p>
            <p className="text-2xl font-black text-brand-gold mt-2">
              {formattedPrice}
            </p>
          </div>

          {/* Lựa chọn phương thức */}
          <div className="space-y-4">
            {/* Lựa chọn 1: VietQR */}
            <button
              onClick={() => onSelect("vietqr")}
              className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-brand-gold/50 bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center gap-4 group"
              style={{ transformOrigin: "center" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                <QrCode size={24} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-base group-hover:text-brand-gold transition-colors">
                  Chuyển khoản VietQR
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Quét mã QR qua ứng dụng ngân hàng, kích hoạt tức thì.
                </div>
              </div>
            </button>

            {/* Lựa chọn 2: MoMo */}
            <button
              onClick={() => onSelect("momo")}
              className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-[#D82D8B]/50 bg-white/5 hover:bg-[#D82D8B]/5 transition-all duration-300 flex items-center gap-4 group"
              style={{ transformOrigin: "center" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-[#D82D8B]/10 border border-[#D82D8B]/20 flex items-center justify-center text-[#D82D8B] group-hover:bg-[#D82D8B]/20 group-hover:text-[#ff66b2] transition-colors">
                <CreditCard size={24} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-base group-hover:text-[#ff66b2] transition-colors flex items-center gap-1.5">
                  Ví điện tử MoMo
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#D82D8B]/20 text-[#ff66b2] rounded font-medium uppercase tracking-wider">
                    Sandbox
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Thanh toán an toàn qua cổng MoMo điện thoại hoặc Web.
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">
              Bằng việc thanh toán, bạn đồng ý với các Điều khoản dịch vụ của CineFlix.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
