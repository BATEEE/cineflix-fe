import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { FloatingInput } from "./FloatingInput";

const loginSchema = z.object({
  email: z.email("Vui lòng nhập email hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin, isLoading, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col gap-4">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-red-300 text-[13.5px]">
          ⚠️ {error}
        </div>
      )}

      <FloatingInput
        label="Email"
        type="email"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      />

      <div className="relative">
        <FloatingInput
          label="Mật khẩu"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-[18px] text-zinc-400 hover:text-white transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 w-full bg-[#E50914] hover:bg-[#C11119] text-white text-[15px] font-semibold h-[50px] rounded-xl transition-all duration-300 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-[#E50914]/20 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Đang xác thực...
          </>
        ) : (
          "Đăng nhập"
        )}
      </button>

      <div className="flex items-center justify-end text-zinc-400 text-[13px] mt-2 px-1">
        <a
          href="#"
          className="hover:underline hover:text-white transition-colors"
        >
          Bạn cần trợ giúp?
        </a>
      </div>
    </form>
  );
};
