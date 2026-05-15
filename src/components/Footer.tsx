import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 py-12 px-4 sm:px-8 lg:px-12 mt-auto border-t border-white/10">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Brand & Socials */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-brand-red font-black text-2xl tracking-tighter">
            <Film className="w-8 h-8" />
            <span>CINEFLIX</span>
          </div>
          <p className="text-[13px] leading-relaxed">
            Nền tảng xem phim trực tuyến hàng đầu với kho nội dung khổng lồ, chất lượng chuẩn bản quyền và trải nghiệm tối ưu nhất.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a href="#" className="text-[13px] hover:text-white transition-colors">Facebook</a>
            <a href="#" className="text-[13px] hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-[13px] hover:text-white transition-colors">Instagram</a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-medium mb-1">Công ty</h4>
          <Link to="#" className="text-[13px] hover:underline">Giới thiệu về Cineflix</Link>
          <Link to="#" className="text-[13px] hover:underline">Cơ hội việc làm</Link>
          <Link to="#" className="text-[13px] hover:underline">Thông tin báo chí</Link>
          <Link to="#" className="text-[13px] hover:underline">Liên hệ</Link>
        </div>

        {/* Links Column 2 */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-medium mb-1">Hỗ trợ</h4>
          <Link to="#" className="text-[13px] hover:underline">Trung tâm trợ giúp</Link>
          <Link to="#" className="text-[13px] hover:underline">Tài khoản & Thanh toán</Link>
          <Link to="#" className="text-[13px] hover:underline">Các gói dịch vụ</Link>
          <Link to="#" className="text-[13px] hover:underline">Thiết bị hỗ trợ</Link>
        </div>

        {/* Links Column 3 */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-medium mb-1">Pháp lý</h4>
          <Link to="#" className="text-[13px] hover:underline">Điều khoản sử dụng</Link>
          <Link to="#" className="text-[13px] hover:underline">Quyền riêng tư</Link>
          <Link to="#" className="text-[13px] hover:underline">Tùy chọn cookie</Link>
          <Link to="#" className="text-[13px] hover:underline">Thông tin bản quyền</Link>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px]">
        <p>&copy; {new Date().getFullYear()} Cineflix. All rights reserved.</p>
        <div className="flex gap-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-4 opacity-50" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-50" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="MasterCard" className="h-4 opacity-50" />
        </div>
      </div>
    </footer>
  );
};
