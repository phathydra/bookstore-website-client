import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TablePagination,
    Button, Box, TextField, List, ListItem, ListItemText, IconButton, Drawer, Popper
} from '@mui/material';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import AddDiscount from './AddDiscount';
import UpdateDiscount from './UpdateDiscount';
import DiscountDetail from './DiscountDetail';
import CloseIcon from '@mui/icons-material/Close';
// Removed unused imports: ClickAwayListener, EditIcon, DeleteIcon

const DiscountManagement = () => {
    const [discounts, setDiscounts] = useState({});
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isApplyDrawerOpen, setIsApplyDrawerOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false); // State for detail drawer
    const [error, setError] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const addButtonRef = useRef(null);
    const anchorRef = useRef(null);

    // Define fetchDiscounts using useCallback to make it a stable dependency
    const fetchDiscounts = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8081/api/discounts?page=${page}&size=${rowsPerPage}`);
            setDiscounts(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching discounts:', error);
            setError('Failed to fetch discounts. Please try again.');
        }
    }, [page, rowsPerPage]); // Dependencies for fetchDiscounts

    useEffect(() => {
        fetchDiscounts();
    }, [page, rowsPerPage, fetchDiscounts]); // Added fetchDiscounts to dependency array

    const fetchRecommendedBooks = useCallback(async (query) => {
        if (!query) {
            setRecommendedBooks([]);
            return;
        }
        try {
            const response = await axios.post(`http://localhost:8081/api/book/search_recommended?bookName=${query}`, selectedBooks.map(book => book.bookId));
            setRecommendedBooks(response.data);
        } catch (error) {
            console.error('Error fetching recommended books:', error);
            setRecommendedBooks([]);
        }
    }, [selectedBooks]); // Added selectedBooks to dependency array

    const fetchDiscountedBooks = useCallback(async (discountId) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/book/discounted_books?discountId=${discountId}`);
            setSelectedBooks(response.data);
        } catch (error) {
            console.error('Error fetching discounted books:', error);
            setSelectedBooks([]);
            setError('Failed to fetch discounted books. Please try again.');
        }
    }, []); // No external dependencies for this specific fetch

    const handleSearchChange = (event) => {
        const query = event.target.value;
        setSearchQuery(query);
    };

    useEffect(() => {
        if (!searchQuery.trim()) {
            setRecommendedBooks([]);
            return;
        }

        const delayDebounce = setTimeout(() => {
            fetchRecommendedBooks(searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, fetchRecommendedBooks]); // Added fetchRecommendedBooks to dependency array

    const handleBookSelect = (book) => {
        if (!selectedBooks.some(selectedBook => selectedBook.bookId === book.bookId)) {
            setSelectedBooks((prev) => [...prev, book]);
        }
        setSearchQuery('');
        setRecommendedBooks([]);
    };

    const handleRemoveBook = (bookId) => {
        setSelectedBooks((prev) => prev.filter((book) => book.bookId !== bookId));
    };

    const handleOpenApplyDrawer = (discount) => {
        setSelectedDiscount(discount);
        fetchDiscountedBooks(discount.id);
        setIsApplyDrawerOpen(true);
    };

    const handleConfirmApplyDiscount = async () => {
        if (!selectedDiscount || selectedBooks.length === 0) {
            alert("Please select a discount and at least one book!");
            return;
        }

        try {
            await axios.put(`http://localhost:8081/api/discounts/addDiscountToBooks?discountId=${selectedDiscount.id}`,
                selectedBooks.map(book => book.bookId),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            alert(`Applied ${selectedDiscount?.percentage}% discount to ${selectedBooks.length} books.`);
            setSelectedBooks([]);
            setIsApplyDrawerOpen(false);
            if (addButtonRef.current) {
                addButtonRef.current.focus();
            }
        } catch (error) {
            console.error("Error applying discount:", error);
            setError("An error occurred while applying the discount!");
        }
    };

    const handleCloseApplyDrawer = () => {
        if (addButtonRef.current) {
            addButtonRef.current.focus();
        }
        setIsApplyDrawerOpen(false);
        setSelectedDiscount(null);
        setSelectedBooks([]);
        setSearchQuery('');
        setRecommendedBooks([]);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleOpenUpdateModal = (discount) => {
        setSelectedDiscount(discount);
        setIsUpdateModalOpen(true);
        setIsDetailDrawerOpen(false); // Close detail drawer when opening update modal
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedDiscount(null);
        fetchDiscounts(); // Refresh data after update
    };

    const handleDeleteDiscount = async (id) => {
        if (window.confirm('Are you sure you want to delete this discount?')) {
            try {
                await axios.delete(`http://localhost:8081/api/discounts/${id}`);
                fetchDiscounts(); // Refresh data after delete
                setIsDetailDrawerOpen(false); // Close detail drawer after deletion
                setSelectedDiscount(null);
            } catch (error) {
                console.error('Error deleting discount:', error);
                setError('Failed to delete discount. Please try again.');
            }
        }
    };

    const handleRowClick = (discount) => {
        setSelectedDiscount(discount);
        setIsDetailDrawerOpen(true);
    };

    const handleCloseDetailDrawer = () => {
        setIsDetailDrawerOpen(false);
        setSelectedDiscount(null);
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
                <Header title="QUẢN LÝ MÃ GIẢM GIÁ" isCollapsed={isCollapsed} />
                <div className="p-10 pt-20 flex w-full overflow-x-auto" style={{ gap: '1rem' }}>
                    <Box className="flex-1 overflow-auto">
                        <Box className="flex justify-between mb-2">
                            <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                                Discount List
                            </Typography>
                            <Button
                                variant="contained"
                                style={{ backgroundColor: 'green' }}
                                onClick={() => setIsAddModalOpen(true)}
                                ref={addButtonRef}
                            >
                                Thêm mã giảm giá
                            </Button>
                        </Box>
                        {error && (
                            <Typography color="error" sx={{ mb: 2 }}>
                                {error}
                            </Typography>
                        )}
                        <TableContainer component={Paper} style={{ maxHeight: '70vh', overflowX: 'auto' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Phần trăm</TableCell>
                                        <TableCell>Ngày bắt đầu</TableCell>
                                        <TableCell>Ngày kết thúc</TableCell>
                                        <TableCell>Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {discounts.content?.map((discount) => (
                                        <TableRow
                                            key={discount.id}
                                            hover
                                            onClick={() => handleRowClick(discount)} // Open detail drawer on row click
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <TableCell>{discount.id}</TableCell>
                                            <TableCell>{discount.percentage}%</TableCell>
                                            <TableCell>{new Date(discount.startDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(discount.endDate).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row click from firing
                                                        handleOpenApplyDrawer(discount);
                                                    }}
                                                >
                                                    Áp dụng
                                                </Button>
                                            </TableCell>
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

                {/* Drawer for applying discount */}
                <Drawer
                    anchor="right"
                    open={isApplyDrawerOpen}
                    onClose={handleCloseApplyDrawer}
                    sx={{
                        width: 400,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': { width: 400, boxSizing: 'border-box', padding: '20px' },
                    }}
                >
                    <Typography variant="h6" sx={{ marginBottom: 2 }}>
                        Apply {selectedDiscount?.percentage}% Discount
                    </Typography>

                    <TextField
                        fullWidth
                        label="Search Books"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        inputRef={anchorRef}
                        sx={{ marginBottom: 2 }}
                    />

                    {/* Popper for Recommended Books */}
                    <Popper
                        open={recommendedBooks.length > 0}
                        anchorEl={anchorRef.current}
                        placement="bottom-start"
                        disablePortal={true}
                        modifiers={[
                            {
                                name: 'preventOverflow',
                                enabled: true,
                                options: {
                                    boundary: 'viewport',
                                },
                            },
                        ]}
                        sx={{ zIndex: 1300 }}
                    >
                        <Paper
                            elevation={4}
                            sx={{
                                backgroundColor: '#fff',
                                marginTop: 1,
                                border: '1px solid #ccc',
                                width: 360,
                            }}
                        >
                            <List
                                sx={{
                                    maxHeight: 200,
                                    overflowY: 'auto',
                                    borderRadius: 2,
                                }}
                            >
                                {recommendedBooks.map((book) => (
                                    <ListItem
                                        key={book.bookId}
                                        button
                                        onClick={() => handleBookSelect(book)}
                                        sx={{
                                            transition: 'background-color 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                            },
                                        }}
                                    >
                                        <ListItemText primary={book.bookName} secondary={book.bookAuthor} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Popper>

                    <Box sx={{ marginTop: 2 }}>
                        {selectedBooks.length > 0 && (
                            <>
                                <Typography variant="subtitle1">Selected Books:</Typography>
                                <List>
                                    {selectedBooks.map((book) => (
                                        <ListItem
                                            key={book.bookId}
                                            sx={{ border: '1px solid #ddd', borderRadius: 1, marginBottom: 1 }}
                                        >
                                            <ListItemText primary={book.bookName} secondary={book.bookAuthor} />
                                            <IconButton onClick={() => handleRemoveBook(book.bookId)}>
                                                <CloseIcon />
                                            </IconButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                    </Box>

                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{ marginTop: 2 }}
                        onClick={handleConfirmApplyDiscount}
                    >
                        Confirm
                    </Button>
                </Drawer>

                {/* Drawer for Discount Details */}
                <Drawer
                    anchor="right"
                    open={isDetailDrawerOpen}
                    onClose={handleCloseDetailDrawer}
                    sx={{
                        width: 400,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 400,
                            boxSizing: 'border-box',
                            padding: '20px'
                        },
                    }}
                >
                    <DiscountDetail
                        selectedDiscount={selectedDiscount}
                        handleOpenUpdateModal={() => handleOpenUpdateModal(selectedDiscount)}
                        handleDeleteDiscount={() => handleDeleteDiscount(selectedDiscount.id)}
                        onClose={handleCloseDetailDrawer}
                    />
                </Drawer>


                {isAddModalOpen && <AddDiscount onClose={() => { setIsAddModalOpen(false); fetchDiscounts(); }} />}
                {isUpdateModalOpen && <UpdateDiscount selectedDiscount={selectedDiscount} onClose={handleCloseUpdateModal} />}
            </main>
        </div>
    );
};

export default DiscountManagement;