import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { FloatingInput } from "./FloatingInput";

const registerSchema = z
  .object({
    username: z.string().min(3, "Username tối thiểu 3 ký tự."),
    displayName: z.string().min(2, "Tên hiển thị tối thiểu 2 ký tự."),
    email: z.email("Vui lòng nhập email hợp lệ."),
    password: z.string().min(6, "Mật khẩu từ 6 ký tự trở lên."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp.",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess: (email: string, message: string) => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const { handleRegister, isLoading, error } = useRegister(onSuccess);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(handleRegister)}
      className="flex flex-col gap-4 my-4"
    >
      {error && (
        <div className="px-4 py-3 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-red-300 text-[13.5px]">
          ⚠️ {error}
        </div>
      )}

      <FloatingInput
        label="Username"
        {...register("username")}
        error={errors.username?.message}
      />
      <FloatingInput
        label="Tên hiển thị"
        {...register("displayName")}
        error={errors.displayName?.message}
      />
      <FloatingInput
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <FloatingInput
        label="Mật khẩu"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />
      <FloatingInput
        label="Xác nhận mật khẩu"
        type="password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 w-full bg-[#E50914] hover:bg-[#C11119] text-white text-[15px] font-semibold h-[50px] rounded-xl transition-all duration-300 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-[#E50914]/20"
      >
        {isLoading ? "Đang gửi mã xác thực..." : "Đăng ký ngay"}
      </button>
    </form>
  );
};
