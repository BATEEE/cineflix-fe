import { useState } from "react";
import { Film } from "lucide-react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { OtpForm } from "@/features/auth/components/OtpForm";

type AuthStep = "login" | "register" | "otp";

export const AuthPage = () => {
  const [step, setStep] = useState<AuthStep>("login");
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  const handleRegisterSuccess = (email: string, message: string) => {
    setPendingEmail(email);
    setOtpMessage(message);
    setStep("otp");
  };

  const switchStep = (newStep: AuthStep) => {
    setStep(newStep);
    setOtpMessage(null);
  };

  return (
    <div className="relative flex min-h-screen sm:items-center justify-center bg-black selection:bg-[#E50914]/30">
      {/* Background */}
      <div
        className="hidden sm:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop")',
        }}
      />
      <div className="hidden sm:block absolute inset-0 z-0 bg-gradient-to-b from-black/90 via-black/40 to-black/90" />

      {/* Logo */}
      <div className="absolute top-0 left-0 p-5 sm:p-8 z-20 w-full bg-gradient-to-b from-black/80 to-transparent sm:bg-none">
        <div className="flex items-center gap-2 text-[#E50914] font-black text-3xl tracking-tighter">
          <Film className="w-8 h-8" />
          <span>CINEFLIX</span>
        </div>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-[460px] flex flex-col pt-24 px-6 pb-10 sm:pt-14 sm:px-12 sm:pb-14 sm:bg-black/60 sm:rounded-2xl sm:backdrop-blur-xl sm:border sm:border-white/[0.08] min-h-screen sm:min-h-0 sm:shadow-2xl my-4">
        <h2 className="text-[32px] font-bold text-white mb-8 tracking-tight">
          {step === "login"
            ? "Đăng nhập"
            : step === "register"
              ? "Đăng ký"
              : "Xác thực Email"}
        </h2>

        {/* ─── FORMS ─── */}
        {step === "login" && <LoginForm />}
        {step === "register" && (
          <RegisterForm onSuccess={handleRegisterSuccess} />
        )}
        {step === "otp" && (
          <OtpForm email={pendingEmail} successMessage={otpMessage} />
        )}

        {/* Footer Toggle */}
        <div className="mt-12 sm:mt-10 text-zinc-400 text-[15px] text-center">
          {step === "login" ? (
            <p>
              Bạn mới tham gia Cineflix?{" "}
              <button
                onClick={() => switchStep("register")}
                className="text-white font-medium hover:underline focus:outline-none ml-1 transition-colors"
              >
                Đăng ký ngay.
              </button>
            </p>
          ) : step === "register" ? (
            <p>
              Đã có tài khoản?{" "}
              <button
                onClick={() => switchStep("login")}
                className="text-white font-medium hover:underline focus:outline-none ml-1 transition-colors"
              >
                Đăng nhập.
              </button>
            </p>
          ) : (
            <p>
              <button
                onClick={() => switchStep("register")}
                className="text-white font-medium hover:underline focus:outline-none transition-colors"
              >
                ← Quay lại đăng ký
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
