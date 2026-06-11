import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Crown, Star, Zap, Shield } from "lucide-react";
import vipPackageService, {
  type VipPackage,
} from "@/services/vipPackageService";
import { useAuthStore } from "@/stores/authStore";
import { VietQRPaymentModal } from "@/components/VietQRPaymentModal";
import { PaymentSelectionModal } from "@/components/PaymentSelectionModal";

const PACKAGE_ICONS = [Crown, Star, Zap];
const PACKAGE_COLORS = [
  { border: "rgba(255,193,7,0.6)", glow: "rgba(255,193,7,0.15)" },
  { border: "rgba(147,51,234,0.6)", glow: "rgba(147,51,234,0.15)" },
  { border: "rgba(59,130,246,0.6)", glow: "rgba(59,130,246,0.15)" },
];

const PERKS = [
  { icon: Shield, label: "Mở khóa tất cả phim VIP" },
  { icon: Zap, label: "Chất lượng 4K / Full HD" },
  { icon: Star, label: "Không quảng cáo" },
];

export const VipPage = () => {
  const [packages, setPackages] = useState<VipPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<VipPackage | null>(null);
  const [showSelection, setShowSelection] = useState(false);
  const [showVietQR, setShowVietQR] = useState(false);
  const { isAuthenticated, user, setVip } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    vipPackageService
      .getAll()
      .then((data) => {
        setPackages(data.filter((p) => p.isActive));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleOpenPayment = (pkg: VipPackage) => {
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để mua VIP");
      navigate("/login");
      return;
    }
    if (user?.isVip) {
      toast.info("Bạn đã là thành viên VIP!");
      return;
    }
    setSelectedPkg(pkg);
    setShowSelection(true);
  };

  const handleSelectMethod = async (method: "vietqr" | "momo") => {
    if (!selectedPkg) return;
    setShowSelection(false);

    if (method === "vietqr") {
      setShowVietQR(true);
    } else if (method === "momo") {
      const toastId = toast.loading("Đang khởi tạo giao dịch MoMo...");
      try {
        const response = await vipPackageService.purchase({
          packageId: selectedPkg.id,
          paymentMethod: "MoMo",
        });

        if (response.success && response.data?.payUrl) {
          toast.success("Đang chuyển hướng sang MoMo...", { id: toastId });
          window.location.href = response.data.payUrl;
        } else {
          toast.error(response.message || "Không thể tạo liên kết thanh toán MoMo", { id: toastId });
        }
      } catch (err: any) {
        console.error("MoMo purchase error:", err);
        toast.error("Đã xảy ra lỗi khi kết nối với cổng thanh toán MoMo", { id: toastId });
      }
    }
  };

  const handlePaymentSuccess = async () => {
    if (!selectedPkg) return;
    try {
      await vipPackageService.purchase({
        packageId: selectedPkg.id,
        paymentMethod: "VietQR",
      });
    } catch (err) {
      console.error("Purchase API error:", err);
    } finally {
      // Luôn cập nhật local store dù API thành công hay lỗi (demo mode)
      setVip();
      toast.success(`🎉 Kích hoạt ${selectedPkg.packageName} thành công!`, {
        description: `Tận hưởng ${selectedPkg.durationMonths} tháng VIP không giới hạn.`,
        duration: 5000,
      });
    }
  };

  const handleCloseModal = () => {
    setSelectedPkg(null);
    setShowSelection(false);
    setShowVietQR(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm">Đang tải gói VIP...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-brand-bg"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,193,7,0.08) 0%, transparent 60%), #141414",
      }}
    >
      <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
        {/* ── Hero ── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            <Crown size={13} />
            Thành viên VIP
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Nâng cấp trải nghiệm
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #FFC107, #FF8F00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              CineFlix VIP
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Xem phim không giới hạn, chất lượng 4K, hoàn toàn không quảng cáo.
          </p>

          {/* Perks bar */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {PERKS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-gray-300"
              >
                <Icon size={14} className="text-brand-gold" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── VIP Status Banner ── */}
        {user?.isVip && (
          <div className="mb-10 p-4 rounded-xl border border-brand-gold/40 bg-brand-gold/10 text-center">
            <p className="text-brand-gold font-semibold">
              ✨ Bạn đang là thành viên VIP! Cảm ơn vì đã ủng hộ CineFlix.
            </p>
          </div>
        )}

        {/* ── Packages Grid ── */}
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg, idx) => {
            const Icon = PACKAGE_ICONS[idx % PACKAGE_ICONS.length];
            const color = PACKAGE_COLORS[idx % PACKAGE_COLORS.length];
            const isPopular = idx === 1;

            return (
              <div
                key={pkg.id}
                className="relative rounded-2xl p-px overflow-hidden group cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                style={{
                  background: `linear-gradient(135deg, ${color.border}, transparent 60%)`,
                  boxShadow: `0 0 30px ${color.glow}`,
                }}
                onClick={() => handleOpenPayment(pkg)}
              >
                {isPopular && (
                  <div
                    className="absolute -top-px left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-b-lg text-black z-10"
                    style={{
                      background:
                        "linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)",
                    }}
                  >
                    PHỔ BIẾN NHẤT
                  </div>
                )}

                <div
                  className="rounded-2xl p-6 h-full flex flex-col"
                  style={{ background: "#1a1a2e" }}
                >
                  {/* Icon + name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: color.glow, border: `1px solid ${color.border}` }}
                    >
                      <Icon size={18} className="text-brand-gold" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {pkg.packageName}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    <span
                      className="text-3xl font-black"
                      style={{
                        background: "linear-gradient(135deg, #FFC107, #FF8F00)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(pkg.price)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">
                    Thời hạn {pkg.durationMonths} tháng
                  </p>

                  {/* Perks */}
                  <div className="space-y-2 mb-8 flex-1">
                    {PERKS.map(({ label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <span className="text-brand-gold text-xs">✓</span>
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    className="w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 group-hover:scale-[1.02]"
                    style={
                      user?.isVip
                        ? {
                            background: "rgba(255,193,7,0.1)",
                            border: "1px solid rgba(255,193,7,0.3)",
                            color: "#FFC107",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)",
                            color: "#000",
                            boxShadow: "0 4px 20px rgba(255,193,7,0.3)",
                          }
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPayment(pkg);
                    }}
                  >
                    {user?.isVip ? "Đang hoạt động ✓" : "Mua ngay →"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Phương thức thanh toán ── */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-3">Hỗ trợ thanh toán qua</p>
          <div className="flex justify-center items-center gap-6 text-gray-400">
            <span className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              🏦 VietQR
            </span>
            <span className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              📱 Ví MoMo
            </span>
          </div>
        </div>
      </div>

      {/* ── Modal Chọn Phương Thức Thanh Toán ── */}
      {selectedPkg && showSelection && (
        <PaymentSelectionModal
          pkg={selectedPkg}
          onClose={handleCloseModal}
          onSelect={handleSelectMethod}
        />
      )}

      {/* ── Modal VietQR ── */}
      {selectedPkg && showVietQR && (
        <VietQRPaymentModal
          pkg={selectedPkg}
          onClose={handleCloseModal}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
