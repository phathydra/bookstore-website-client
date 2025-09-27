import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from "recharts";
import {
    FaUsers, FaBox, FaMoneyBillWave, FaDollarSign, FaArrowTrendUp, FaArrowTrendDown,
    FaTag, FaBookBookmark, FaXmark, FaChevronLeft, FaChevronRight, FaWarehouse,
    FaRegStar
} from "react-icons/fa6"; 
import SideNav from "../../components/SideNav/SideNav";
import Header from "../../components/Header/Header";

// Utils
const formatCurrency = v => v == null ? "..." : Math.round(v).toLocaleString() + " đ";

// Card
const DashboardCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-4 hover:shadow-lg transition">
        <div className={`p-4 rounded-full ${color} text-white`}><Icon size={24} /></div>
        <div>
            <h2 className="text-gray-500 font-medium">{title}</h2>
            <p className="text-2xl font-bold text-gray-800 mt-1 truncate">{value ?? "..."}</p>
        </div>
    </div>
);

// Chart wrapper
const ChartSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md">
        <h3 className="mb-6 text-xl font-semibold text-gray-700">{title}</h3>
        {children}
    </div>
);

// ==================== Modal Sách Bán Không Chạy ====================
const WorstSellingBooksModal = ({ isOpen, onClose, startDate, endDate }) => {
    const [books, setBooks] = useState([]), [loading, setLoading] = useState(false);
    const [error, setError] = useState(null), [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0), size = 10;

    const fetchData = async p => {
        setLoading(true); setError(null);
        try {
            const res = await axios.get("http://localhost:8082/api/orders/worst-selling", {
                params: {
                    startDate: startDate && `${startDate}T00:00:00`,
                    endDate: endDate && `${endDate}T23:59:59`,
                    page: p, size
                }
            });
            setBooks(res.data.content); setTotalPages(res.data.totalPages); setPage(res.data.number);
        } catch {
            setError("Không thể tải dữ liệu chi tiết. Vui lòng kiểm tra API.");
        } finally { setLoading(false); }
    };

    useEffect(() => { if (isOpen) fetchData(0); }, [isOpen, startDate, endDate]);
    if (!isOpen) return null;

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchData(newPage);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                        <FaBookBookmark className="text-red-600" /> Danh sách Sách Bán Không Chạy (Đã Bán)
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaXmark size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading && <p className="text-center text-gray-500">Đang tải dữ liệu...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {!loading && !error &&
                        <>
                            <p className="mb-4 text-sm text-gray-600 border-l-4 border-red-400 pl-3 py-1 bg-red-50">
                                Dữ liệu chỉ tính các đơn hàng **ĐÃ XỬ LÝ/HOÀN THÀNH** trong khoảng thời gian đã chọn.
                            </p>
                            <table className="w-full border-collapse">
                                <thead className="bg-red-50">
                                    <tr className="text-left text-sm text-gray-600">
                                        <th className="p-4 border">#</th>
                                        <th className="p-4 border">Tên sách</th>
                                        <th className="p-4 border text-center">Số lượng bán</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.map((b, i) => (
                                        <tr key={b.bookId} className="border-b hover:bg-gray-50">
                                            <td className="p-4 text-gray-500">{page * size + i + 1}</td>
                                            <td className="p-4">{b.bookName}</td>
                                            <td className="p-4 font-semibold text-center text-red-600">{b.totalSold}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!books.length && <p className="text-center py-6 text-gray-500 italic">Không tìm thấy dữ liệu.</p>}
                        </>
                    }
                </div>

                <div className="p-4 border-t flex justify-between items-center">
                    <p className="text-sm">Trang {totalPages ? page + 1 : 0} / {totalPages}</p>
                    <div className="flex gap-2">
                        <button disabled={page === 0 || loading} onClick={() => handlePageChange(page - 1)}
                            className="px-3 py-1 border rounded-md disabled:opacity-50 flex items-center gap-1">
                            <FaChevronLeft size={12} /> Trước
                        </button>
                        <button disabled={page >= totalPages - 1 || loading} onClick={() => handlePageChange(page + 1)}
                            className="px-3 py-1 border rounded-md disabled:opacity-50 flex items-center gap-1">
                            Tiếp <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== Modal Cảnh Báo Tồn Kho Thấp ====================
const LowStockAlertsModal = ({ isOpen, onClose, threshold = 20 }) => {
    const [alerts, setAlerts] = useState([]), [loading, setLoading] = useState(false);
    const [error, setError] = useState(null), [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0), size = 10;

    const fetchData = async p => {
        setLoading(true); setError(null);
        try {
            const res = await axios.get("http://localhost:8082/api/orders/dashboard/low-stock-alerts", {
                params: { page: p, size, threshold }
            });
            setAlerts(res.data.content); setTotalPages(res.data.totalPages); setPage(res.data.number);
        } catch {
            setError("Không thể tải dữ liệu cảnh báo tồn kho. Vui lòng kiểm tra API.");
        } finally { setLoading(false); }
    };

    useEffect(() => { if (isOpen) fetchData(0); }, [isOpen, threshold]);
    if (!isOpen) return null;

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchData(newPage);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                        <FaWarehouse className="text-orange-600" /> Danh sách Sách Cảnh báo sắp hết hàng (Ngưỡng: {threshold})
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaXmark size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading && <p className="text-center text-gray-500">Đang tải dữ liệu...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {!loading && !error &&
                        <>
                            <table className="w-full border-collapse">
                                <thead className="bg-orange-50">
                                    <tr className="text-left text-sm text-gray-600">
                                        <th className="p-4 border">#</th>
                                        <th className="p-4 border">Tên sách</th>
                                        <th className="p-4 border text-center">Tồn kho</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alerts.map((b, i) => (
                                        <tr key={b.bookId} className="border-b bg-orange-50/50 hover:bg-orange-100">
                                            <td className="p-4 text-gray-500">{page * size + i + 1}</td>
                                            <td className="p-4">{b.bookName}</td>
                                            <td className="p-4 font-semibold text-center text-orange-600">{b.stockQuantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!alerts.length && <p className="text-center py-6 text-gray-500 italic">Không có sách nào dưới ngưỡng cảnh báo ({threshold}).</p>}
                        </>
                    }
                </div>

                <div className="p-4 border-t flex justify-between items-center">
                    <p className="text-sm">Trang {totalPages ? page + 1 : 0} / {totalPages}</p>
                    <div className="flex gap-2">
                        <button disabled={page === 0 || loading} onClick={() => handlePageChange(page - 1)}
                            className="px-3 py-1 border rounded-md disabled:opacity-50 flex items-center gap-1">
                            <FaChevronLeft size={12} /> Trước
                        </button>
                        <button disabled={page >= totalPages - 1 || loading} onClick={() => handlePageChange(page + 1)}
                            className="px-3 py-1 border rounded-md disabled:opacity-50 flex items-center gap-1">
                            Tiếp <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== NEW: Modal Sách Bán Chạy Đều ====================
const ConsistentSellersModal = ({ isOpen, onClose, months, minAvgMonthlySales }) => {
    const [books, setBooks] = useState([]), [loading, setLoading] = useState(false);
    const [error, setError] = useState(null), [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0), size = 10;

    const fetchData = async p => {
        setLoading(true); setError(null);
        try {
            const res = await axios.get("http://localhost:8082/api/orders/dashboard/consistent-sellers", {
                params: { page: p, size, months, minAvgMonthlySales } 
            });
            setBooks(res.data.content); setTotalPages(res.data.totalPages); setPage(res.data.number);
        } catch {
            setError("Không thể tải dữ liệu Sách Bán Chạy Đều. Vui lòng kiểm tra API.");
        } finally { setLoading(false); }
    };

    useEffect(() => {
        if (isOpen) fetchData(0);
    }, [isOpen, months, minAvgMonthlySales]);
    
    if (!isOpen) return null;

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchData(newPage);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                        <FaRegStar className="text-amber-500" /> Danh sách Sách Bán Chạy Đều (Đã Bán)
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaXmark size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading && <p className="text-center text-gray-500">Đang tải dữ liệu...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {!loading && !error &&
                        <>
                            <div className="mb-4 text-sm text-gray-600 border-l-4 border-amber-400 pl-3 py-1 bg-amber-50">
                                <p className="font-semibold">Thống kê chỉ tính các đơn hàng **ĐÃ XỬ LÝ/HOÀN THÀNH**.</p>
                                <p>Khoảng thời gian: **{months}** tháng gần nhất. Trung bình bán hàng tối thiểu: **{minAvgMonthlySales}** cuốn/tháng.</p>
                            </div>
                            <table className="w-full border-collapse">
                                <thead className="bg-amber-50">
                                    <tr className="text-left text-sm text-gray-600">
                                        <th className="p-4 border">#</th>
                                        <th className="p-4 border">Tên sách</th>
                                        <th className="p-4 border text-center">Tổng lượng bán</th>
                                        <th className="p-4 border text-center">Trung bình tháng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.map((b, i) => (
                                        <tr key={b.bookId} className="border-b hover:bg-amber-50">
                                            <td className="p-4 text-gray-500">{page * size + i + 1}</td>
                                            <td className="p-4 font-medium">{b.bookName}</td>
                                            <td className="p-4 font-semibold text-center text-green-600">{b.totalSold.toLocaleString()}</td>
                                            <td className="p-4 font-semibold text-center text-amber-600">{(b.totalSold / months).toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!books.length && <p className="text-center py-6 text-gray-500 italic">Không tìm thấy sách bán chạy đều theo tiêu chí.</p>}
                        </>
                    }
                </div>

                <div className="p-4 border-t flex justify-between items-center">
                    <p className="text-sm">Trang {totalPages ? page + 1 : 0} / {totalPages}</p>
                    <div className="flex gap-2">
                        <button disabled={page === 0 || loading} onClick={() => handlePageChange(page - 1)}
                            className="px-3 py-1 border rounded-md disabled:opacity-50 flex items-center gap-1">
                            <FaChevronLeft size={12} /> Trước
                        </button>
                        <button disabled={page >= totalPages - 1 || loading} onClick={() => handlePageChange(page + 1)}
                            className="px-3 py-1 border rounded-md disabled:opacity-50 flex items-center gap-1">
                            Tiếp <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// ==================== END NEW MODAL ====================

// ==================== MAIN DASHBOARD ====================
export default function Dashboard() {
    const [data, setData] = useState({
        totalRevenue: null, totalOrders: null, uniqueCustomers: null,
        totalImportPrice: null, totalProfit: null, averageOrderValue: null,
        orderStatus: [], revenueData: [], topBooks: [], topCategories: [], worstSellingBooks: [],
        totalLowStockAlerts: null,
        totalConsistentSellers: null, 
    });
    const [loading, setLoading] = useState(true), [error, setError] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [lowStockModalOpen, setLowStockModalOpen] = useState(false);
    const [consistentSellersModalOpen, setConsistentSellersModalOpen] = useState(false); 

    const defaultEnd = useMemo(() => new Date().toISOString().split("T")[0], []);
    const defaultStart = useMemo(() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d.toISOString().split("T")[0]; }, []);
    const [startDate, setStartDate] = useState(defaultStart), [endDate, setEndDate] = useState(defaultEnd);

    // THAM SỐ CỦA SÁCH BÁN CHẠY ĐỀU
    const [months, setMonths] = useState(3); 
    const [minAvgMonthlySales, setMinAvgMonthlySales] = useState(10); 
    const lowStockThreshold = 20;

    // UseEffect để gọi API
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true); setError(null);
            // NOTE: API này dùng cho tất cả các chỉ số (trừ consistent sellers)
            const params = { startDate: `${startDate}T00:00:00`, endDate: `${endDate}T23:59:59` };
            try {
                const [topBooks, topCats, status, orders, revenue, revByMonth, customers, importPrice, worst, totalLowStock, totalConsistent] = 
                    await Promise.all([
                        axios.get("http://localhost:8082/api/orders/top-selling", { params }),
                        axios.get("http://localhost:8082/api/orders/top-selling-categories", { params }),
                        axios.get("http://localhost:8082/api/orders/dashboard/order-status", { params }),
                        axios.get("http://localhost:8082/api/orders/dashboard/total-orders", { params }),
                        axios.get("http://localhost:8082/api/orders/dashboard/total-revenue", { params }),
                        axios.get("http://localhost:8082/api/orders/dashboard/revenue-by-month", { params }),
                        axios.get("http://localhost:8082/api/orders/dashboard/unique-customers", { params }),
                        axios.get("http://localhost:8081/api/imports/total-price", { params }),
                        axios.get("http://localhost:8082/api/orders/worst-selling", { params: { ...params, page: 0, size: 5 } }),
                        axios.get("http://localhost:8082/api/orders/dashboard/low-stock-alerts", { params: { page: 0, size: 1, threshold: lowStockThreshold } }),
                        // API Consistent Sellers - Chỉ dùng months, không dùng startDate/endDate
                        axios.get("http://localhost:8082/api/orders/dashboard/consistent-sellers", { params: { page: 0, size: 1, months, minAvgMonthlySales } }),
                    ]);

                const tRev = revenue.data, tOrd = orders.data, tImp = importPrice.data.totalPrice;
                setData({
                    totalRevenue: tRev, totalOrders: tOrd, uniqueCustomers: customers.data,
                    totalImportPrice: tImp, totalProfit: tRev - tImp,
                    averageOrderValue: tOrd ? tRev / tOrd : 0,
                    orderStatus: status.data,
                    revenueData: revByMonth.data.map(it => {
                        const [y, m] = it.period.split("-"); return { ...it, displayPeriod: `Tháng ${+m}/${y}` };
                    }),
                    topBooks: topBooks.data.slice(0, 5).map(b => ({ name: b.bookName, sales: b.totalSold })),
                    topCategories: topCats.data.slice(0, 5).map(c => ({ name: c.bookName, sales: c.totalSold })),
                    worstSellingBooks: worst.data.content.map(b => ({ name: b.bookName, sales: b.totalSold })),
                    totalLowStockAlerts: totalLowStock.data.totalElements,
                    totalConsistentSellers: totalConsistent.data.totalElements, 
                });
            } catch (e) {
                console.error("Error fetching dashboard data:", e);
                setError("Không thể tải dữ liệu.");
            }
            finally { setLoading(false); }
        };
        // Dependency list để đảm bảo dữ liệu cập nhật khi thay đổi ngày hoặc tiêu chí bán chạy đều
        fetchAll();
    }, [startDate, endDate, months, minAvgMonthlySales]); 

    if (loading) return <div className="flex items-center justify-center h-screen">Đang tải...</div>;
    if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;

    const { totalRevenue, totalOrders, uniqueCustomers, totalImportPrice, totalProfit,
        averageOrderValue, orderStatus, revenueData, topBooks, topCategories, worstSellingBooks,
        totalLowStockAlerts, totalConsistentSellers } = data; 

    const profitNeg = totalProfit != null && totalProfit < 0;

    return (
        <div className="flex h-screen">
            <SideNav onToggleCollapse={setIsCollapsed} />
            <main className="flex-1 bg-gray-50 flex flex-col" style={{ paddingLeft: isCollapsed ? "5%" : "16.5%" }}>
                <Header title="TỔNG QUAN DASHBOARD" isCollapsed={isCollapsed} className="sticky top-0 bg-white shadow-md" />
                <div className="flex-1 overflow-auto p-6 space-y-8">
                    {/* Filter */}
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                        <label className="font-medium">Thống kê đơn hàng ĐÃ BÁN từ:</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded-md px-3 py-2" />
                        <label>đến</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded-md px-3 py-2" />
                    </div>

                    {/* Cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <DashboardCard title="Doanh thu" value={formatCurrency(totalRevenue)} icon={FaMoneyBillWave} color="bg-green-500" />
                        <DashboardCard title="Tổng giá nhập" value={formatCurrency(totalImportPrice)} icon={FaDollarSign} color="bg-rose-500" />
                        <DashboardCard title="Tổng lợi nhuận" value={formatCurrency(totalProfit)} icon={profitNeg ? FaArrowTrendDown : FaArrowTrendUp} color={profitNeg ? "bg-red-500" : "bg-purple-500"} />

                        {/* Card Cảnh báo tồn kho thấp */}
                        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-4 hover:shadow-lg transition">
                            <div className="p-4 rounded-full bg-orange-500 text-white"><FaWarehouse size={24} /></div>
                            <div>
                                <h2 className="text-gray-500 font-medium">Cảnh báo sắp hết hàng</h2>
                                <p className={`text-2xl font-bold mt-1 truncate ${totalLowStockAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>{totalLowStockAlerts?.toLocaleString() ?? "..."}</p>
                                <button onClick={() => setLowStockModalOpen(true)} className="mt-1 text-sm font-medium text-orange-500 hover:text-orange-700 underline">Xem chi tiết</button>
                            </div>
                        </div>

                        {/* Card Sách Bán Chạy Đều */}
                        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-4 hover:shadow-lg transition">
                            <div className="p-4 rounded-full bg-amber-500 text-white"><FaRegStar size={24} /></div>
                            <div>
                                <h2 className="text-gray-500 font-medium">Sách Bán Chạy Đều (Đã Bán)</h2>
                                <p className={`text-2xl font-bold mt-1 truncate ${totalConsistentSellers > 0 ? 'text-amber-600' : 'text-gray-600'}`}>{totalConsistentSellers?.toLocaleString() ?? "..."}</p>
                                <button onClick={() => setConsistentSellersModalOpen(true)} className="mt-1 text-sm font-medium text-amber-500 hover:text-amber-700 underline">Xem chi tiết</button>
                            </div>
                        </div>

                        {/* Các cards còn lại */}
                        <DashboardCard title="Tổng đơn hàng" value={totalOrders?.toLocaleString()} icon={FaBox} color="bg-blue-500" />
                        <DashboardCard title="Khách hàng" value={uniqueCustomers?.toLocaleString()} icon={FaUsers} color="bg-sky-500" />
                        <DashboardCard title="Giá trị đơn TB" value={formatCurrency(averageOrderValue)} icon={FaDollarSign} color="bg-indigo-500" />
                    </div>

                    {/* Section Cấu hình Sách Bán Chạy Đều */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h3 className="mb-4 text-xl font-semibold text-gray-700">⚙️ Tiêu chí Sách Bán Chạy Đều</h3>
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center gap-2">
                                <label className="text-gray-600">Khoảng thời gian (tháng):</label>
                                <input
                                    type="number" min="1" max="12"
                                    value={months}
                                    onChange={e => setMonths(Math.max(1, Math.min(12, +e.target.value)))}
                                    className="border rounded-md px-3 py-2 w-20 text-center"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-gray-600">TB bán tối thiểu (cuốn/tháng):</label>
                                <input
                                    type="number" min="1"
                                    value={minAvgMonthlySales}
                                    onChange={e => setMinAvgMonthlySales(Math.max(1, +e.target.value))}
                                    className="border rounded-md px-3 py-2 w-20 text-center"
                                />
                            </div>
                        </div>
                    </div>


                    {/* Charts */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        <ChartSection title="📈 Doanh thu theo thời gian (Đã Bán)">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="displayPeriod" /><YAxis tickFormatter={formatCurrency} />
                                    <Tooltip formatter={v => [formatCurrency(v), "Doanh thu"]} /><Legend />
                                    <Line type="monotone" dataKey="totalRevenue" stroke="#4f46e5" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartSection>
                        <ChartSection title="📊 Đơn hàng theo trạng thái">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={orderStatus}><CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="status" /><YAxis /><Tooltip /><Legend />
                                    <Bar dataKey="count" fill="#10b981" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartSection>
                    </div>

                    {/* Tables */}
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Top Books */}
                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="mb-4 font-semibold">📚 Top 5 sách bán chạy (Đã Bán)</h3>
                            <table className="w-full">
                                <thead><tr><th className="p-2 border">Tên sách</th><th className="p-2 border">Số lượng</th></tr></thead>
                                <tbody>{topBooks.map((b, i) => <tr key={i}><td className="p-2 border">{b.name}</td><td className="p-2 border text-blue-600">{b.sales}</td></tr>)}</tbody>
                            </table>
                        </div>
                        {/* Top Categories */}
                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="mb-4 font-semibold">🏷️ Top 5 thể loại (Đã Bán)</h3>
                            <table className="w-full">
                                <thead><tr><th className="p-2 border">Tên thể loại</th><th className="p-2 border">Số lượng</th></tr></thead>
                                <tbody>{topCategories.map((c, i) => <tr key={i}><td className="p-2 border flex items-center gap-2"><FaTag />{c.name}</td><td className="p-2 border text-purple-600">{c.sales}</td></tr>)}</tbody>
                            </table>
                        </div>
                        {/* Worst Selling */}
                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="mb-4 font-semibold flex justify-between items-center">
                                🐢 Sách bán không chạy (Top 5 - Đã Bán)
                                <button onClick={() => setModalOpen(true)} className="text-red-500 hover:text-red-700 text-sm">Xem chi tiết</button>
                            </h3>
                            <table className="w-full">
                                <thead><tr><th className="p-2 border">Tên sách</th><th className="p-2 border">Số lượng</th></tr></thead>
                                <tbody>{worstSellingBooks.length ? worstSellingBooks.map((b, i) =>
                                    <tr key={i}><td className="p-2 border flex items-center gap-2"><FaBookBookmark />{b.name}</td><td className="p-2 border text-red-600">{b.sales}</td></tr>
                                ) : <tr><td colSpan={2} className="text-center italic">Tất cả sách đều bán chạy!</td></tr>}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <WorstSellingBooksModal isOpen={modalOpen} onClose={() => setModalOpen(false)} startDate={startDate} endDate={endDate} />
            <LowStockAlertsModal isOpen={lowStockModalOpen} onClose={() => setLowStockModalOpen(false)} threshold={lowStockThreshold} />
            <ConsistentSellersModal 
                isOpen={consistentSellersModalOpen} 
                onClose={() => setConsistentSellersModalOpen(false)} 
                months={months} 
                minAvgMonthlySales={minAvgMonthlySales} 
            />
        </div>
    );
}