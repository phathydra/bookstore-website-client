import React, { useState } from 'react';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header'; 
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TablePagination, Button, Box, Card, CardContent, Divider, Grid
} from '@mui/material';
import AddSupplier from './AddSupplier';
import UpdateSupplier from './UpdateSupplier';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([
    {
      _id: '1',
      name: 'Supplier A',
      email: 'supplierA@example.com',
      address: '123 Main St, City, Country'
    }
  ]);

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handleSelectSupplier = (supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleOpenUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const handleAddSupplier = (newSupplier) => {
    setSuppliers([...suppliers, { ...newSupplier, _id: `${suppliers.length + 1}` }]);
  };

  const handleUpdateSupplier = (updatedSupplier) => {
    setSuppliers(suppliers.map(supplier => supplier._id === selectedSupplier._id ? { ...updatedSupplier, _id: selectedSupplier._id } : supplier));
    setSelectedSupplier(null);
  };

  const handleDeleteSupplier = () => {
    setSuppliers(suppliers.filter(supplier => supplier._id !== selectedSupplier._id));
    setSelectedSupplier(null);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/5 bg-white shadow-md z-50">
        <SideNav />
      </div>

      <main className="flex-1 bg-gray-100 relative flex">
        <Header title="Supplier Management" />

        <div className="p-10 pt-20 flex w-full" style={{ gap: '1rem' }}>
          <Box className="flex-1 overflow-auto">
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
              Supplier List
            </Typography>

            <TableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier._id} onClick={() => handleSelectSupplier(supplier)} hover>
                      <TableCell>{supplier._id}</TableCell>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>{supplier.address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={suppliers.length}
              rowsPerPage={10}
              page={0}
            />
          </Box>

          <Box className="w-1/3 p-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg flex flex-col justify-between">
            <Card variant="outlined">
              <CardContent>
                {selectedSupplier ? (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{selectedSupplier.name}</Typography>
                    <Typography>Email: {selectedSupplier.email}</Typography>
                    <Typography>Address: {selectedSupplier.address}</Typography>
                    <Divider sx={{ width: '100%', mb: 2 }} />
                  </>
                ) : (
                  <Typography>Select a supplier to see details</Typography>
                )}
              </CardContent>
            </Card>

            <Box className="flex justify-center space-x-4">
              <Button variant="contained" style={{ backgroundColor: 'green' }} onClick={handleOpenAddModal}>Add</Button>
              <Button variant="contained" disabled={!selectedSupplier} onClick={handleOpenUpdateModal}>Edit</Button>
              <Button variant="contained" color="error" disabled={!selectedSupplier} onClick={handleDeleteSupplier}>Delete</Button>
            </Box>
          </Box>
        </div>

        {isAddModalOpen && <AddSupplier onAdd={handleAddSupplier} onClose={handleCloseAddModal} />}
        {isUpdateModalOpen && selectedSupplier && <UpdateSupplier supplier={selectedSupplier} onUpdate={handleUpdateSupplier} onClose={handleCloseUpdateModal} />}
      </main>
    </div>
  );
};

export default SupplierManagement;
