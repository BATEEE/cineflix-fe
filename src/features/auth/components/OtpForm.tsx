import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ShieldCheck, RefreshCw } from "lucide-react";
import { useOtp } from "@/features/auth/hooks/useOtp";
import { FloatingInput } from "./FloatingInput";

const otpSchema = z.object({
  code: z.string().length(6, "Mã OTP phải có đúng 6 chữ số."),
});

type OtpFormData = z.infer<typeof otpSchema>;

interface OtpFormProps {
  email: string;
  successMessage?: string | null;
}

export const OtpForm = ({
  email,
  successMessage: initialSuccess,
}: OtpFormProps) => {
  const {
    handleVerify,
    handleResend,
    isVerifying,
    isResending,
    error,
    successMsg,
    setSuccessMsg,
  } = useOtp();
  const displaySuccess = successMsg || initialSuccess;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = (data: OtpFormData) => {
    handleVerify({ email, code: data.code });
  };

  return (
    <div className="flex flex-col items-center gap-6 my-4">
      {error && (
        <div className="w-full px-4 py-3 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-red-300 text-[13.5px]">
          ⚠️ {error}
        </div>
      )}
      {displaySuccess && !error && (
        <div className="w-full px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-[13.5px]">
          ✅ {displaySuccess}
        </div>
      )}

      <div className="w-20 h-20 rounded-full bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center">
        <ShieldCheck className="w-10 h-10 text-[#E50914]" />
      </div>
      <div className="text-center">
        <p className="text-zinc-300 text-[15px] leading-relaxed">
          Mã xác thực 6 chữ số đã được gửi đến
        </p>
        <p className="text-white font-semibold mt-1 flex items-center justify-center gap-2">
          <Mail className="w-4 h-4 text-[#E50914]" />
          {email}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col gap-4"
      >
        <FloatingInput
          label="Nhập mã OTP (6 chữ số)"
          maxLength={6}
          {...register("code")}
          error={errors.code?.message}
        />
        <button
          type="submit"
          disabled={isVerifying}
          className="w-full bg-[#E50914] hover:bg-[#C11119] text-white text-[15px] font-semibold h-[50px] rounded-xl transition-all duration-300 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-[#E50914]/20"
        >
          {isVerifying ? "Đang xác thực..." : "Xác nhận"}
        </button>
      </form>

      <button
        onClick={() => {
          setSuccessMsg(null);
          handleResend(email);
        }}
        disabled={isResending}
        className="flex items-center gap-2 text-zinc-400 hover:text-white text-[13px] transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
        {isResending ? "Đang gửi lại..." : "Gửi lại mã OTP"}
      </button>
    </div>
  );
};
