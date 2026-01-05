import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaFire, FaStar, FaGift, FaChevronLeft, FaChevronRight, FaBolt, FaTags, FaBookOpen, FaChartLine } from "react-icons/fa";

// Import API & Client
import axiosClient from "../../api/axiosClient";

// Import Components
import Slider from "../../components/slider/slider.jsx";
import Book from "../../components/book/book.jsx";
import CountdownTimer from "../../components/timer/CountdownTimer.jsx"; 

// Import Hooks
import { useBooks } from "./hooks/useBooks.js";
import { useDiscountedBooks } from "./hooks/useDiscountedBooks.js";
import { useTopSellingBooks } from "./hooks/useTopSellingBooks.js";
import { useSuggestedBooks } from "./hooks/useSuggestedBooks.js";
import { useActiveCombos } from "./hooks/useActiveCombos.js";

const Home = () => {
    const navigate = useNavigate();
    const accountId = localStorage.getItem("accountId");
    const token = localStorage.getItem("token");

    // --- STATES ---
    const [flashSaleBooks, setFlashSaleBooks] = useState([]);
    const [flashSaleEndTime, setFlashSaleEndTime] = useState(null);

    const [discountedPage, setDiscountedPage] = useState(0);
    const [topSellingPage, setTopSellingPage] = useState(0);
    const [suggestedPage, setSuggestedPage] = useState(0);
    const [recentBookIds, setRecentBookIds] = useState([]);
    const [hoveredBtn, setHoveredBtn] = useState(null);

    // --- HOOKS ---
    const { discountedBooks, discountedTotalPages } = useDiscountedBooks(discountedPage);
    const { books: categoryBooks } = useBooks();
    const { topSellingBooks } = useTopSellingBooks();
    const { activeCombos, loadingCombos } = useActiveCombos();
    
    // Logic lấy lịch sử xem
    useEffect(() => {
        if (!accountId || !token) { setRecentBookIds([]); return; }
        axiosClient.get(`/analytics/recent-views`)
            .then(res => setRecentBookIds(res.data || []))
            .catch(() => setRecentBookIds([]));
    }, [accountId, token]);
    
    const { suggestedBooks } = useSuggestedBooks(accountId, recentBookIds);

    // --- FLASH SALE LOGIC ---
    useEffect(() => {
        const fetchFlashSale = async () => {
            try {
                const { data } = await axiosClient.get('/discounts/flash-sales', { params: { page: 0, size: 1 } });
                
                if (data?.content?.length > 0) {
                    const currentFlashSale = data.content[0];
                    const endDate = new Date(currentFlashSale.endDate);

                    if (endDate > new Date()) {
                        setFlashSaleEndTime(endDate);
                        const booksRes = await axiosClient.get('/discounts/flash-sales/books', { params: { page: 0, size: 20 } });
                        
                        if(booksRes.data?.content) {
                             const fsPercentage = currentFlashSale.percentage;
                             const mappedBooks = booksRes.data.content.map(b => ({
                                ...b,
                                discountType: 'FLASH_SALE',
                                percentage: fsPercentage, 
                                discountedPrice: Math.round(b.bookPrice * (1 - fsPercentage / 100)), 
                                discountEndDate: currentFlashSale.endDate 
                             }));
                             setFlashSaleBooks(mappedBooks);
                        }
                    }
                }
            } catch (error) {
                console.error("Flash Sale Error:", error);
            }
        };
        fetchFlashSale();
    }, []);

    const validNormalDiscountBooks = useMemo(() => {
        if (!discountedBooks) return [];
        return discountedBooks.filter(book => {
            const isFlash = flashSaleBooks.some(fs => fs.bookId === book.bookId);
            return !isFlash; 
        });
    }, [discountedBooks, flashSaleBooks]);

    // --- UI HELPERS ---
    const BOOKS_PER_PAGE = 5;
    const paginate = (items, page) => {
        if (!items) return [];
        return items.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE);
    };

    // Nút điều hướng được custom lại cho hợp tông màu mới
    const renderNavButton = (dir, onClick, disabled, id) => {
        if (disabled) return null;
        return (
            <button 
                onClick={onClick}
                onMouseEnter={() => setHoveredBtn(id)}
                onMouseLeave={() => setHoveredBtn(null)}
                className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all border border-[#2A5D76]/20 z-10 
                    ${hoveredBtn === id 
                        ? 'bg-[#2A5D76] text-white scale-110' 
                        : 'bg-white text-[#2A5D76] hover:bg-[#2A5D76] hover:text-white'
                    }`}
            >
                {dir === 'prev' ? <FaChevronLeft /> : <FaChevronRight />}
            </button>
        );
    };

    const SectionContainer = ({ title, icon, color, children, headerRight, className = "" }) => (
        <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${className}`}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-[#F4F8FA] p-2 rounded-lg">
                        <span className={`text-2xl ${color}`}>{icon}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-[#2A5D76] uppercase tracking-wide">{title}</h2>
                </div>
                {headerRight}
            </div>
            <div className="relative">{children}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F4F8FA] pb-10">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 flex flex-col gap-8">
                
                {/* 1. SLIDER */}
                <div className="w-full rounded-2xl overflow-hidden shadow-lg bg-white relative z-0 shrink-0 border border-gray-200">
                    <Slider />
                </div>

                {/* 2. FLASH SALE */}
                {flashSaleBooks.length > 0 && flashSaleEndTime && (
                    <div className="rounded-2xl shadow-lg overflow-hidden relative z-10 shrink-0 bg-gradient-to-r from-[#2A5D76] to-[#4A89A8]">
                        <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between border-b border-white/10">
                            <div className="flex items-center gap-4 text-white">
                                <div className="flex items-center gap-2">
                                    <FaBolt className="text-3xl text-[#FFD700] animate-pulse"/>
                                    <h2 className="text-3xl font-extrabold italic tracking-tighter uppercase text-white">FLASH SALE</h2>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <span className="text-sm font-semibold uppercase hidden sm:block opacity-90">Kết thúc trong</span>
                                    <CountdownTimer targetDate={flashSaleEndTime} />
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate('/flash-sale')}
                                className="text-white font-semibold text-sm mt-3 md:mt-0 px-4 py-1.5 rounded-full border border-white/30 hover:bg-white hover:text-[#2A5D76] transition-colors flex items-center"
                            >
                                Xem tất cả <FaChevronRight className="ml-1 text-xs"/>
                            </button>
                        </div>
                        <div className="p-6 relative">
                            <div className="flex overflow-x-auto gap-4 scrollbar-hide pb-4">
                                {flashSaleBooks.map((book) => (
                                    <div key={book.bookId} className="min-w-[190px]"> 
                                        <Book book={book} />
                                        <div className="mt-3 px-1">
                                            <div className="w-full bg-white/20 rounded-full h-4 relative overflow-hidden border border-white/30">
                                                <div className="bg-[#E67E22] h-full absolute top-0 left-0" style={{width: `${Math.floor(Math.random() * 60) + 40}%`}}></div>
                                                <div className="absolute w-full text-center text-[10px] font-bold text-white uppercase leading-4 z-10 drop-shadow-md">Đang bán chạy</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. SÁCH GIẢM GIÁ THƯỜNG - Ẩn nếu không có */}
                {validNormalDiscountBooks.length > 0 && (
                    <SectionContainer 
                        title="Ưu Đãi Mỗi Ngày" 
                        icon={<FaTags />} 
                        color="text-[#E67E22]"
                        headerRight={
                            <div className="flex gap-2">
                                {renderNavButton('prev', () => setDiscountedPage(p => Math.max(0, p-1)), discountedPage === 0, 'd-prev')}
                                {renderNavButton('next', () => setDiscountedPage(p => Math.min(discountedTotalPages-1, p+1)), discountedPage === discountedTotalPages - 1, 'd-next')}
                            </div>
                        }
                    >
                        <div className="flex overflow-x-auto gap-4 scrollbar-hide pb-4">
                            {validNormalDiscountBooks.map(book => (
                                <div key={book.bookId} className="min-w-[180px]">
                                    <Book book={book} />
                                </div>
                            ))}
                        </div>
                    </SectionContainer>
                )}

                {/* 4. COMBO */}
                <SectionContainer 
                    title="Combo Tiết Kiệm" 
                    icon={<FaGift />} 
                    color="text-[#2A5D76]"
                    headerRight={
                        <button 
                            onClick={() => navigate('/combos')} 
                            className="text-sm text-gray-500 hover:text-[#2A5D76] flex items-center transition-colors"
                        >
                            Xem tất cả <FaChevronRight className="ml-1 text-xs"/>
                        </button>
                    }
                >
                    <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
                        {loadingCombos ? (
                            <div className="text-center w-full text-gray-400">Đang tải...</div> 
                        ) : activeCombos?.length > 0 ? (
                            activeCombos.map(combo => (
                                <div 
                                    key={combo.comboId} 
                                    onClick={() => navigate(`/combo/${combo.comboId}`)} 
                                    className="min-w-[280px] max-w-[280px] bg-white border border-gray-100 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all hover:border-[#2A5D76]/50 flex flex-col overflow-hidden"
                                >
                                    <div className="relative w-full h-48 bg-[#F8FAFC] flex items-center justify-center overflow-hidden border-b border-gray-50">
                                        {combo.image ? (
                                            <img 
                                                src={combo.image} 
                                                alt={combo.name}
                                                className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105" 
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-[#2A5D76]/40">
                                                <FaBookOpen size={40} />
                                                <span className="font-bold text-sm">Combo Hot</span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-[11px] font-extrabold px-2 py-1 rounded shadow-sm">
                                            {combo.discountType === "PERCENT" ? `GIẢM ${combo.discountValue}%` : 'GIÁ SỐC'}
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col flex-grow">
                                        <h3 className="font-bold text-[#2A5D76] truncate text-base mb-1" title={combo.name}>
                                            {combo.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed h-8">
                                            {combo.description || "Ưu đãi đặc biệt khi mua theo bộ sách."}
                                        </p>
                                        <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                                            <span className="text-[#E67E22] font-bold text-sm">Xem chi tiết</span>
                                            <FaChevronRight className="text-[#E67E22] text-[10px]"/>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="w-full text-center py-10 text-gray-400">Hiện chưa có combo nào.</div>
                        )}
                    </div>
                </SectionContainer>

                {/* 5. SÁCH BÁN CHẠY */}
                <SectionContainer 
                    title="Sách Bán Chạy Nhất" 
                    icon={<FaChartLine />} 
                    color="text-[#E67E22]" 
                    headerRight={
                        <div className="flex gap-2">
                             {renderNavButton('prev', () => setTopSellingPage(p => Math.max(0, p-1)), topSellingPage === 0, 't-prev')}
                             {renderNavButton('next', () => setTopSellingPage(p => p+1), (topSellingPage + 1) * BOOKS_PER_PAGE >= topSellingBooks.length, 't-next')}
                        </div>
                    }
                >
                    <div className="flex overflow-x-auto gap-4 scrollbar-hide pb-2">
                         {topSellingBooks?.length > 0 ? (
                             paginate(topSellingBooks, topSellingPage).map(book => (
                                 <div key={book.bookId} className="min-w-[190px]">
                                     <Book book={book} />
                                 </div>
                             ))
                         ) : (
                             <p className="p-4 text-gray-500 w-full text-center">Đang cập nhật...</p>
                         )}
                    </div>
                </SectionContainer>

                {/* 6. GỢI Ý (Nền Gradient nhẹ nhàng) - ẨN NẾU KHÔNG CÓ */}
                {suggestedBooks?.length > 0 && (
                    <div className="rounded-xl shadow-sm p-6 border border-gray-100 bg-gradient-to-r from-[#F4F8FA] to-white relative">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <span className="text-2xl text-[#2A5D76]"><FaStar /></span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-[#2A5D76] uppercase tracking-wide">Gợi Ý Hôm Nay</h2>
                            </div>
                        </div>

                        <div className="flex overflow-x-auto gap-4 scrollbar-hide pb-2 relative z-10">
                            {paginate(suggestedBooks, suggestedPage).map(book => (
                                <div key={book.bookId} className="min-w-[190px]">
                                    <Book book={book} />
                                </div>
                            ))}
                        </div>
                        
                        {/* Nút điều hướng */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20">
                            {renderNavButton('prev', () => setSuggestedPage(p => Math.max(0, p-1)), suggestedPage === 0, 's-prev')}
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20">
                            {renderNavButton('next', () => setSuggestedPage(p => p+1), (suggestedPage + 1) * BOOKS_PER_PAGE >= suggestedBooks.length, 's-next')}
                        </div>
                    </div>
                )}

                {/* 7. DANH MỤC */}
                <div className="mt-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-2 bg-[#2A5D76] rounded-full"></div>
                        <h2 className="text-2xl font-bold text-[#2A5D76] uppercase tracking-wide">Khám phá theo danh mục</h2>
                    </div>
                    <div className="flex flex-col gap-8">
                        {categoryBooks && Object.entries(categoryBooks).map(([category, items]) => (
                            <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="bg-[#F4F8FA] px-6 py-4 border-b border-gray-100 flex justify-between items-center group-hover:bg-[#EBF5F8] transition-colors">
                                    <h3 className="font-bold text-[#2A5D76] text-lg flex items-center">
                                        <FaBookOpen className="mr-3 opacity-70"/>
                                        {category}
                                    </h3>
                                    <button onClick={() => navigate(`/category/${encodeURIComponent(category)}`)} className="text-[#2A5D76] text-sm font-semibold hover:underline flex items-center">
                                        Xem thêm <FaChevronRight className="ml-1 text-xs"/>
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="flex overflow-x-auto gap-4 scrollbar-hide pb-2">
                                        {items && items.map(book => (
                                            <div key={book.bookId} className="min-w-[160px]">
                                                <Book book={book} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Home;