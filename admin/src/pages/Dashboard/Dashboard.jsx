import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { FaUsers, FaBox, FaMoneyBillWave, FaDollarSign, FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";

// Thêm các component SideNav và Header
import SideNav from "../../components/SideNav/SideNav";
import Header from "../../components/Header/Header";

// Component con cho Card tổng quan
const DashboardCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-4 transition-all duration-300 hover:shadow-lg">
    <div className={`p-4 rounded-full ${color} text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <h2 className="text-gray-500 font-medium">{title}</h2>
      <p className="text-2xl font-bold text-gray-800 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
        {value !== null ? value : "..."}
      </p>
    </div>
  </div>
);

// Component con cho các biểu đồ
const ChartSection = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md">
    <h3 className="mb-6 text-xl font-semibold text-gray-700">{title}</h3>
    {children}
  </div>
);

export default function Dashboard() {
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [orderStatus, setOrderStatus] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [totalOrders, setTotalOrders] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [uniqueCustomers, setUniqueCustomers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [averageOrderValue, setAverageOrderValue] = useState(null);
  const [totalImportPrice, setTotalImportPrice] = useState(null);
  const [totalProfit, setTotalProfit] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const params = {
      startDate: startDate ? `${startDate}T00:00:00` : undefined,
      endDate: endDate ? `${endDate}T23:59:59` : undefined,
    };

    try {
      const [
        topBooksRes,
        orderStatusRes,
        totalOrdersRes,
        totalRevenueRes,
        revenueDataRes,
        uniqueCustomersRes,
        totalImportPriceRes,
      ] = await Promise.all([
        axios.get("http://localhost:8082/api/orders/top-selling"),
        axios.get("http://localhost:8082/api/orders/dashboard/order-status", {
          params,
        }),
        axios.get("http://localhost:8082/api/orders/dashboard/total-orders", {
          params,
        }),
        axios.get("http://localhost:8082/api/orders/dashboard/total-revenue", {
          params,
        }),
        axios.get(
          "http://localhost:8082/api/orders/dashboard/revenue-by-month",
          { params }
        ),
        axios.get(
          "http://localhost:8082/api/orders/dashboard/unique-customers",
          { params }
        ),
        axios.get(
          "http://localhost:8081/api/imports/total-price",
          { params }
        ),
      ]);

      const formattedTopBooks = topBooksRes.data.slice(0, 5).map((item) => ({
        name: item.bookName,
        sales: item.totalSold,
      }));
      setTopBooks(formattedTopBooks);

      setOrderStatus(orderStatusRes.data);
      setTotalOrders(totalOrdersRes.data);
      setTotalRevenue(totalRevenueRes.data);
      setUniqueCustomers(uniqueCustomersRes.data);
      setTotalImportPrice(totalImportPriceRes.data.totalPrice);

      const formattedRevenueData = revenueDataRes.data.map((item) => {
        const [year, month] = item.period.split("-");
        return {
          ...item,
          displayPeriod: `Tháng ${parseInt(month)}/${year}`,
        };
      });
      setRevenueData(formattedRevenueData);
      
      // Tính toán AOV từ dữ liệu đã có
      if (totalRevenueRes.data !== null && totalOrdersRes.data > 0) {
        setAverageOrderValue(totalRevenueRes.data / totalOrdersRes.data);
      } else {
        setAverageOrderValue(0);
      }

      // Tính toán lợi nhuận sau khi đã có doanh thu và giá nhập
      if (totalRevenueRes.data !== null && totalImportPriceRes.data.totalPrice !== null) {
        setTotalProfit(totalRevenueRes.data - totalImportPriceRes.data.totalPrice);
      } else {
        setTotalProfit(null);
      }

      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const handleToggleMenu = (collapsed) => {
    setIsCollapsed(collapsed);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center text-red-500">
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const profitColor = totalProfit !== null && totalProfit < 0 ? "bg-red-500" : "bg-purple-500";
  const profitIcon = totalProfit !== null && totalProfit < 0 ? FaArrowTrendDown : FaArrowTrendUp;

  return (
    <div className="flex h-screen">
      <SideNav onToggleCollapse={handleToggleMenu} />

      <main
        className="flex-1 bg-gray-50 relative flex flex-col transition-all duration-300"
        style={{ paddingLeft: isCollapsed ? "5%" : "16.5%" }}
      >
        <Header
          title="TỔNG QUAN DASHBOARD"
          isCollapsed={isCollapsed}
          className="sticky top-0 z-50 bg-white shadow-md"
        />

        <div className="flex-1 overflow-auto p-6 space-y-8 bg-gray-50 font-sans pt-[72px]">
          {/* Thanh lọc ngày tháng */}
          <div className="flex items-center gap-4">
            <label className="text-gray-600 font-medium">Từ ngày:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-gray-600 font-medium">Đến ngày:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cards tổng quan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            <DashboardCard
              title="Doanh thu"
              value={
                totalRevenue !== null
                  ? totalRevenue.toLocaleString() + " đ"
                  : "..."
              }
              icon={FaMoneyBillWave}
              color="bg-green-500"
            />
            <DashboardCard
              title="Tổng giá nhập"
              value={
                totalImportPrice !== null
                  ? totalImportPrice.toLocaleString() + " đ"
                  : "..."
              }
              icon={FaDollarSign}
              color="bg-rose-500"
            />
            <DashboardCard
              title="Tổng lợi nhuận"
              value={
                totalProfit !== null
                  ? totalProfit.toLocaleString() + " đ"
                  : "..."
              }
              icon={profitIcon}
              color={profitColor}
            />
            <DashboardCard
              title="Tổng đơn hàng"
              value={totalOrders !== null ? totalOrders.toLocaleString() : "..."}
              icon={FaBox}
              color="bg-blue-500"
            />
            <DashboardCard
              title="Khách hàng"
              value={
                uniqueCustomers !== null
                  ? uniqueCustomers.toLocaleString()
                  : "..."
              }
              icon={FaUsers}
              color="bg-orange-500"
            />
            <DashboardCard
              title="Giá trị đơn hàng TB"
              value={
                averageOrderValue !== null
                  ? Math.round(averageOrderValue).toLocaleString() + " đ"
                  : "..."
              }
              icon={FaDollarSign}
              color="bg-indigo-500"
            />
          </div>

          {/* Biểu đồ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSection title="📈 Doanh thu theo thời gian">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <XAxis dataKey="displayPeriod" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke="#4f46e5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection title="📊 Đơn hàng theo trạng thái">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>
          </div>

          {/* Bảng top sách */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="mb-4 text-xl font-semibold text-gray-700">
              📚 Top 5 sách bán chạy
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="p-4 border font-medium">Tên sách</th>
                    <th className="p-4 border font-medium">Số lượng bán</th>
                  </tr>
                </thead>
                <tbody>
                  {topBooks.map((book, idx) => (
                    <tr
                      key={idx}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-gray-800">{book.name}</td>
                      <td className="p-4 font-semibold text-blue-600">
                        {book.sales}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}