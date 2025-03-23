import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TablePagination, Button, Box, Drawer
} from '@mui/material';
import { Resizable } from 'react-resizable';
import AddDiscount from './AddDiscount';
import UpdateDiscount from './UpdateDiscount';
import DiscountDetail from './DiscountDetail';


const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState({});
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [displayedDiscounts, setDisplayedDiscounts] = useState([]);

  useEffect(() => {
    fetchDiscounts();
  }, [page, rowsPerPage]);

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/api/discounts?page=${page}&size=${rowsPerPage}`);
      setDiscounts(response.data);
      setDisplayedDiscounts(response.data?.content || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  };

  const handleSelectDiscount = (discount) => {
    setSelectedDiscount(discount);
    setIsDrawerOpen(true);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleOpenUpdateModal = () => {
    setIsUpdateModalOpen(true);
    setIsDrawerOpen(false);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setIsDrawerOpen(true);
  };

  const handleDeleteDiscount = async () => {
    try {
      await axios.delete(`http://localhost:8081/api/discounts/${selectedDiscount.id}`);
      setIsDrawerOpen(false);
      fetchDiscounts(); // Refresh the list without reloading the page
    } catch (error) {
      console.error('Error deleting discount:', error);
    }
  };

  const ResizableCell = (props) => {
    const { width, ...restProps } = props;
    if (!width) {
      return <TableCell {...restProps} />;
    }
    return (
      <Resizable width={width} height={0} handle={<span className="react-resizable-handle" />}>
        <TableCell {...restProps} />
      </Resizable>
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/6 bg-white shadow-md z-50 fixed h-full">
        <SideNav />
      </div>

      <main className="flex-1 bg-gray-100 relative flex flex-col" style={{ paddingLeft: '14.5%' }}>
        <Header title="Discount Management" />

        <div className="p-10 pt-20 flex w-full overflow-x-auto" style={{ gap: '1rem' }}>
          <Box className="flex-1 overflow-auto">
            <Box className="flex justify-between mb-2">
              <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Discount List
              </Typography>
              <Button variant="contained" style={{ backgroundColor: 'green' }} onClick={handleOpenAddModal}>
                Add
              </Button>
            </Box>

            <TableContainer component={Paper} style={{ maxHeight: '70vh', overflowX: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <ResizableCell width={100}>ID</ResizableCell>
                    <ResizableCell width={150}>Percentage</ResizableCell>
                    <ResizableCell width={200}>Start Date</ResizableCell>
                    <ResizableCell width={200}>End Date</ResizableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedDiscounts.map((discount) => (
                    <TableRow key={discount.id} onClick={() => handleSelectDiscount(discount)} hover>
                      <TableCell>{discount.id}</TableCell>
                      <TableCell>{discount.percentage}%</TableCell>
                      <TableCell>{new Date(discount.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(discount.endDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={discounts.totalElements || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </div>

        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sx={{
            width: 400,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 400,
              boxSizing: 'border-box',
            },
          }}
        >
          <DiscountDetail 
            selectedDiscount={selectedDiscount}
            handleOpenUpdateModal={handleOpenUpdateModal}
            handleDeleteDiscount={handleDeleteDiscount}
          />
        </Drawer>

        {isAddModalOpen && <AddDiscount onClose={handleCloseAddModal} />}
        {isUpdateModalOpen && (
          <UpdateDiscount 
            selectedDiscount={selectedDiscount} 
            onClose={handleCloseUpdateModal} 
          />
        )}
      </main>
    </div>
  );
};

export default DiscountManagement;