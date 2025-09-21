import React, { useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';

const ApiManagement = () => {
  const [specUrl, setSpecUrl] = useState('http://localhost:8080/v3/api-docs');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const services = [
    { name: 'Accounts Service', url: 'http://localhost:8080/v3/api-docs' },
    { name: 'Books Service', url: 'http://localhost:8081/v3/api-docs' },
    { name: 'Orders Service', url: 'http://localhost:8082/v3/api-docs' }
  ];

  const handleToggleMenu = (collapsed) => {
    setIsCollapsed(collapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Side Navigation */}
      <SideNav onToggleCollapse={handleToggleMenu} />

      {/* Main Content */}
      <main
        className="flex-1 overflow-auto transition-all duration-300 relative"
        style={{ paddingLeft: isCollapsed ? "5%" : "16.5%" }}
      >
        {/* Header */}
        <Header
          title="QUẢN LÝ API"
          isCollapsed={isCollapsed}
          className="sticky top-0 z-50 bg-white shadow-md"
        />

        {/* Cập nhật ở đây: thêm padding top */}
        <div className="p-6 pt-24">
          <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Chọn API Service</h2>
            <select
              onChange={(e) => setSpecUrl(e.target.value)}
              value={specUrl}
              className="w-full md:w-1/2 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {services.map(s => (
                <option key={s.url} value={s.url}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <SwaggerUI url={specUrl} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiManagement;