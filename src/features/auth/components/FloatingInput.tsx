import React from "react";

export const FloatingInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  }
>(({ label, error, type = "text", ...props }, ref) => {
  return (
    <div className="relative w-full group">
      <input
        ref={ref}
        type={type}
        placeholder=" "
        className={`
          peer w-full h-[56px] px-4 pt-5 pb-1.5 rounded-xl text-white text-[15px]
          bg-white/[0.03] border border-white/[0.08] backdrop-blur-md
          focus:outline-none focus:bg-white/[0.06] transition-all duration-300 ease-out
          ${
            error
              ? "border-[#E50914]/50 focus:border-[#E50914] focus:ring-4 focus:ring-[#E50914]/10"
              : "hover:border-white/20 hover:bg-white/[0.05] focus:border-white/40 focus:ring-4 focus:ring-white/[0.03]"
          }
        `}
        {...props}
      />
      <label
        className={`
          absolute left-4 top-4 text-[15px] transition-all duration-300 ease-out pointer-events-none origin-[0]
          peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
          peer-focus:-translate-y-2.5 peer-focus:scale-[0.75]
          peer-[&:not(:placeholder-shown)]:-translate-y-2.5 peer-[&:not(:placeholder-shown)]:scale-[0.75]
          ${error ? "text-[#E50914]/80 peer-focus:text-[#E50914]" : "text-zinc-400 peer-focus:text-zinc-200"}
        `}
      >
        {label}
      </label>
      {error && (
        <p className="text-[#E50914] text-[12.5px] mt-1.5 px-1 font-medium tracking-wide">
          {error}
        </p>
      )}
    </div>
  );
});
FloatingInput.displayName = "FloatingInput";
