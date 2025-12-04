import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import VoucherTab from './Vouchertab/VoucherTab';
import ObtainableVoucherTab from './ObtainableVoucher/ObtainableVoucherTab';
import RankVoucherTab from './RankVoucherTab/RankVoucherTab';

const VoucherManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen">
      <div
        className={`bg-white shadow-md z-50 fixed h-full transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-1/6'}`}
      >
        <SideNav onToggleCollapse={handleToggleCollapse} />
      </div>
      <main
        className="flex-1 bg-gray-100 relative flex flex-col transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '5rem' : '16.666667%' }}
      >
        <Header title="QUẢN LÝ VOUCHER" isCollapsed={isCollapsed} />
        <div className="p-10 pt-20 flex w-full overflow-x-auto" style={{ gap: '1rem' }}>
          <Box className="flex-1 overflow-auto">
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="voucher tabs">
              <Tab label="Vouchers" />
              <Tab label="Obtainable Vouchers" />
              <Tab label="Rank Vouchers" />
            </Tabs>
            {tabValue === 0 && <VoucherTab />}
            {tabValue === 1 && <ObtainableVoucherTab />}
            {tabValue === 2 && <RankVoucherTab />}
          </Box>
        </div>
      </main>
    </div>
  );
};

export default VoucherManagement;