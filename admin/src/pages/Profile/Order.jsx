import React from 'react';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import SideNavProfile from '../../components/SideNav/SideNavProfile';

const orders = [
  {
    shop: 'SIMPSON OFFICIAL',
    product: 'Random Pack Áo Polo hoặc Áo Thun Local Brand SIMPSON - RD01',
    price: '95.200',
    image: 'https://via.placeholder.com/100',
    status: 'Giao hàng thành công'
  },
  {
    shop: 'KIEMLAMOT.VN',
    product: 'KIỂM LÀ MỘT SUNDAY - quần jeans nam dài ống rộng màu xanh',
    price: '179.400',
    image: 'https://via.placeholder.com/100',
    status: 'Giao hàng thành công'
  },
  {
    shop: 'PHỤ KIỆN KUN-KUN',
    product: 'Kính Cường Lực Xiaomi Mi 13 Lite 13 Pro 13 Ultra',
    price: '37.320',
    image: 'https://via.placeholder.com/100',
    status: 'Giao hàng thành công'
  }
  
];

const Order = () => {
  return (
    <div className="flex h-screen">
      {/* Side Navigation */}
      <div className="w-1/5 bg-white shadow-md z-50 border-r-2 border-gray-300">
        <SideNav />
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 relative">
        <Header title="Order Management" />

        <div className="p-2 pt-20 flex w-full">
          {/* Side Profile Navigation */}
          <div className="w-1/4">
            <SideNavProfile />
          </div>

          {/* Order List Section */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md border border-gray-300 ml-4">
            <h2 className="text-2xl font-semibold mb-4">Danh sách Đơn Mua</h2>
            {orders.map((order, index) => (
              <div key={index} className="border-b border-gray-300 pb-4 mb-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <img src={order.image} alt={order.product} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <h3 className="font-semibold">{order.shop}</h3>
                    <p>{order.product}</p>
                    <p className="text-red-500 font-bold">₫{order.price}</p>
                  </div>
                </div>
                <div>
                  <p className="text-green-500 font-semibold">{order.status}</p>
                  <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Mua Lại</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Order;
