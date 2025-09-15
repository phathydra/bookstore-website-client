import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

export default function Statistics() {
  const [overview, setOverview] = useState({});
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [topBooks, setTopBooks] = useState([]);

  useEffect(() => {
    setOverview({ revenue: 12000000, orders: 350, customers: 120 });
    setMonthlyRevenue([
      { month: "Jan", revenue: 4000 },
      { month: "Feb", revenue: 3000 },
      { month: "Mar", revenue: 5000 },
      { month: "Apr", revenue: 7000 },
      { month: "May", revenue: 6500 },
    ]);
    setOrderStatus([
      { status: "Pending", count: 50 },
      { status: "Shipped", count: 200 },
      { status: "Cancelled", count: 20 },
      { status: "Completed", count: 80 },
    ]);
    setTopBooks([
      { name: "Sách A", sales: 120 },
      { name: "Sách B", sales: 95 },
      { name: "Sách C", sales: 80 },
      { name: "Sách D", sales: 70 },
      { name: "Sách E", sales: 65 },
    ]);
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="p-6 space-y-8">
      {/* --- Cards tổng quan --- */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500">Doanh thu tháng này</h2>
          <p className="text-2xl font-bold">{overview.revenue?.toLocaleString()} đ</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500">Số đơn hàng</h2>
          <p className="text-2xl font-bold">{overview.orders}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500">Khách hàng mới</h2>
          <p className="text-2xl font-bold">{overview.customers}</p>
        </div>
      </div>

      {/* --- Biểu đồ --- */}
      <div className="grid grid-cols-2 gap-6">
        {/* Doanh thu theo tháng */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="mb-4 font-semibold">Doanh thu theo tháng</h3>
          <LineChart width={500} height={300} data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          </LineChart>
        </div>

        {/* Đơn hàng theo trạng thái */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="mb-4 font-semibold">Đơn hàng theo trạng thái</h3>
          <BarChart width={500} height={300} data={orderStatus}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </div>
      </div>

      {/* --- Bảng top sách --- */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="mb-4 font-semibold">Top 5 sách bán chạy</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Tên sách</th>
              <th className="p-3 border">Số lượng bán</th>
            </tr>
          </thead>
          <tbody>
            {topBooks.map((book, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-3 border">{book.name}</td>
                <td className="p-3 border">{book.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
