import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CartItem from "../../components/cartItem/cartItem";
import "./cart.css";

const Cart = () => {
    const [calculatedCart, setCalculatedCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    const [address, setAddress] = useState(null);
    const navigate = useNavigate();
    const selectAllRef = useRef(null);

    // State cho gợi ý combo "cứng" (từ DB)
    const [comboSuggestions, setComboSuggestions] = useState({});
    const [missingBookDetails, setMissingBookDetails] = useState({});

    // State MỚI cho gợi ý "HOT_SELLER" -> "COLD_SELLER"
    const [hotSellerSuggestions, setHotSellerSuggestions] = useState({}); // { hotBookId: [list of cold_seller_books] }

    const accountId = localStorage.getItem("accountId");

    const fetchCart = useCallback(async () => {
        // ... (Không thay đổi)
        if (!accountId) return;

        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8082/cart/${accountId}`);
            setCalculatedCart(response.data);

            const items = response.data.items || [];
            setSelectedItems(prevSelected => {
                const newSelected = {};
                items.forEach(item => {
                    newSelected[item.bookId] = prevSelected[item.bookId] || false;
                });
                return newSelected;
            });
            setError(null);

        } catch (error) {
            console.error("Lỗi khi tải giỏ hàng", error);
            setError("Không thể tải giỏ hàng, vui lòng thử lại sau.");
            setCalculatedCart(null);
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    const fetchAddress = useCallback(async () => {
        // ... (Không thay đổi)
        if (!accountId) return;
        try {
            const addressResponse = await axios.get(`http://localhost:8080/api/address?accountId=${accountId}`);
            const activeAddress = addressResponse.data.find(addr => addr.status === "ACTIVE");
            if (activeAddress) {
                setAddress({
                    phoneNumber: activeAddress.phoneNumber || "",
                    recipientName: activeAddress.recipientName || "",
                    city: activeAddress.city || "",
                    district: activeAddress.district || "",
                    ward: activeAddress.ward || "",
                    note: activeAddress.note || "",
                });
            } else {
                setAddress(null);
                console.warn("Không tìm thấy địa chỉ hoạt động.");
            }
        } catch (error) {
            console.error("Lỗi khi tải địa chỉ", error);
        }
    }, [accountId]);

    useEffect(() => {
        // ... (Không thay đổi)
        if (!accountId) {
            setLoading(false);
            setError("Vui lòng đăng nhập để xem giỏ hàng.");
            return;
        }
        fetchCart();
        fetchAddress();
    }, [accountId, fetchCart, fetchAddress]);

    const updateQuantity = useCallback(async (bookId, newQuantity) => {
        // ... (Không thay đổi)
        if (newQuantity <= 0) return;
        try {
            await axios.put(`http://localhost:8082/cart/update/${accountId}/${bookId}`, null, {
                params: { quantity: newQuantity }
            });
            fetchCart();
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng", error);
        }
    }, [accountId, fetchCart]);

    const removeItem = useCallback(async (bookId) => {
        // ... (Không thay đổi)
        try {
            await axios.delete(`http://localhost:8082/cart/remove/${accountId}/${bookId}`);
            fetchCart();
            setSelectedItems(prevSelected => {
                const updatedSelection = { ...prevSelected };
                delete updatedSelection[bookId];
                return updatedSelection;
            });
            // Xóa gợi ý combo "cứng"
            setComboSuggestions(prev => {
                const newSuggestions = { ...prev };
                delete newSuggestions[bookId];
                return newSuggestions;
            });
            // Xóa gợi ý combo "HOT"
            setHotSellerSuggestions(prev => {
                const newSuggestions = { ...prev };
                delete newSuggestions[bookId];
                return newSuggestions;
            });
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm", error);
        }
    }, [accountId, fetchCart]);

    // Lấy danh sách item hiện tại từ state
    const currentCartItems = useMemo(() => calculatedCart?.items || [], [calculatedCart]);

    const toggleSelect = useCallback(async (bookId) => {
        // ... (Giữ nguyên logic gợi ý)
        const isCurrentlySelected = selectedItems[bookId];
        const newSelectedState = !isCurrentlySelected;

        setSelectedItems(prevSelected => ({
            ...prevSelected,
            [bookId]: newSelectedState
        }));

        // --- LOGIC GỢI Ý COMBO "CỨNG" (Giữ nguyên) ---
        if (newSelectedState) {
            try {
                const response = await axios.get(`http://localhost:8082/api/admin/combos/suggestions?bookId=${bookId}`);

                const currentBookIdsInCart = calculatedCart?.items.map(item => item.bookId) || [];
                const relevantSuggestions = response.data.filter(combo =>
                    !combo.bookIds.every(id => currentBookIdsInCart.includes(id))
                );

                setComboSuggestions(prev => ({
                    ...prev,
                    [bookId]: relevantSuggestions
                }));

                const allMissingIds = new Set();
                relevantSuggestions.forEach(combo => {
                    combo.bookIds.forEach(id => {
                        if (id !== bookId &&
                            !currentBookIdsInCart.includes(id) &&
                            !missingBookDetails[id]) {
                            allMissingIds.add(id);
                        }
                    });
                });

                if (allMissingIds.size > 0) {
                    const idsWeFetched = Array.from(allMissingIds);
                    const fetchPromises = idsWeFetched.map(id =>
                        axios.get(`http://localhost:8081/api/book/${id}`)
                    );
                    const responses = await Promise.all(fetchPromises);
                    const newDetails = {};
                    responses.forEach((res, index) => {
                        const bookData = res.data;
                        const fetchedId = idsWeFetched[index];
                        if (bookData && bookData.bookName) {
                            newDetails[fetchedId] = {
                                name: bookData.bookName,
                                image: (bookData.bookImages && bookData.bookImages.length > 0) ? bookData.bookImages[0] : null
                            };
                        } else {
                            console.warn(`Cấu trúc dữ liệu sách trả về cho ID ${fetchedId} không như mong đợi:`, bookData);
                        }
                    });
                    setMissingBookDetails(prev => ({
                        ...prev,
                        ...newDetails
                    }));
                }

            } catch (error) {
                console.error(`Lỗi khi lấy gợi ý combo hoặc chi tiết sách cho ${bookId}:`, error);
                setComboSuggestions(prev => {
                    const newSuggestions = { ...prev };
                    delete newSuggestions[bookId];
                    return newSuggestions;
                });
            }
        } else {
            setComboSuggestions(prev => {
                const newSuggestions = { ...prev };
                delete newSuggestions[bookId];
                return newSuggestions;
            });
        }
        // --- KẾT THÚC LOGIC COMBO "CỨNG" ---


        // --- BẮT ĐẦU LOGIC GỢI Ý HOT_SELLER MỚI (Giữ nguyên) ---
        const item = currentCartItems.find(i => i.bookId === bookId);

        // *** GIẢ ĐỊNH QUAN TRỌNG: ***
        // Giả định rằng `item` object (từ calculatedCart.items) 
        // BÂY GIỜ CÓ CHỨA một mảng tags. Vd: item.tags = ["HOT_SELLER", "BEST_AUTHOR"]
        // Bạn PHẢI sửa backend (CartItemResponseDto) để thêm trường "tags" này.
        const isHotSeller = item && item.tags && item.tags.includes("HOT_SELLER");

        if (newSelectedState && isHotSeller) {
            // Đây là sách HOT_SELLER vừa được chọn, ta đi tìm sách COLD_SELLER
            try {
                // Lấy ID các sách đang có trong giỏ để lọc ra
                const currentBookIdsInCart = currentCartItems.map(item => item.bookId);

                // *** GIẢ ĐỊNH API MỚI: ***
                // Giả định bạn có API (bên Book Service, port 8081) để lấy sách theo tag
                // Vd: GET http://localhost:8081/api/book/by-tag/COLD_SELLER?limit=10
                const response = await axios.get(`http://localhost:8081/api/book/by-tag/COLD_SELLER?limit=10`);

                // Giả định response.data là một mảng sách: [{ bookId, bookName, bookImages, originalPrice }]
                const allColdSellers = response.data || [];

                // Lọc ra 5 sách không có trong giỏ hàng
                const suggestions = allColdSellers
                    .filter(coldBook => !currentBookIdsInCart.includes(coldBook.bookId))
                    .slice(0, 5);

                // Định dạng lại cho dễ dùng
                const formattedSuggestions = suggestions.map(book => ({
                    id: book.bookId,
                    name: book.bookName,
                    image: (book.bookImages && book.bookImages.length > 0) ? book.bookImages[0] : null,
                    price: book.originalPrice // (Giả định tên trường là originalPrice, nếu không có thì dùng price)
                }));

                setHotSellerSuggestions(prev => ({
                    ...prev,
                    [bookId]: formattedSuggestions // Lưu gợi ý vào state
                }));

            } catch (error) {
                console.error(`Lỗi khi lấy gợi ý COLD_SELLER cho ${bookId}:`, error);
                // Xóa gợi ý nếu có lỗi
                setHotSellerSuggestions(prev => {
                    const newSuggestions = { ...prev };
                    delete newSuggestions[bookId];
                    return newSuggestions;
                });
            }
        } else {
            // Nếu bỏ chọn, hoặc sách không phải HOT_SELLER, xóa gợi ý (nếu có)
            setHotSellerSuggestions(prev => {
                const newSuggestions = { ...prev };
                delete newSuggestions[bookId];
                return newSuggestions;
            });
        }
        // --- KẾT THÚC LOGIC GỢI Ý HOT_SELLER ---

    }, [selectedItems, calculatedCart, missingBookDetails, currentCartItems]); // <-- Thêm currentCartItems vào dependencies


    const allSelected = useMemo(() => {
        // ... (Không thay đổi)
        return currentCartItems.length > 0 && currentCartItems.every(item => selectedItems[item.bookId]);
    }, [currentCartItems, selectedItems]);

    const someSelected = useMemo(() => {
        // ... (Không thay đổi)
        return currentCartItems.some(item => selectedItems[item.bookId]);
    }, [currentCartItems, selectedItems]);

    const handleSelectAll = (event) => {
        // ... (Không thay đổi)
        const isChecked = event.target.checked;
        const newSelectedItems = {};
        currentCartItems.forEach(item => {
            newSelectedItems[item.bookId] = isChecked;
        });
        setSelectedItems(newSelectedItems);
        // Xóa tất cả gợi ý khi chọn tất cả
        setComboSuggestions({});
        setHotSellerSuggestions({}); // <-- THÊM MỚI
    };

    useEffect(() => {
        // ... (Không thay đổi)
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = someSelected && !allSelected;
        }
    }, [someSelected, allSelected]);


    const finalSelectedTotal = useMemo(() => {
        // ... (Không thay đổi)
        if (!calculatedCart || !calculatedCart.items) return 0;

        let selectedItemsSubtotal = currentCartItems.reduce((sum, item) => {
            if (selectedItems[item.bookId]) {
                return sum + (item.originalPrice * item.quantity);
            }
            return sum;
        }, 0);

        let applicableDiscountAmount = 0;
        if (calculatedCart.appliedDiscounts && calculatedCart.appliedDiscounts.length > 0) {
            if (allSelected) {
                applicableDiscountAmount = calculatedCart.totalDiscountAmount || 0;
            }
        }

        const total = selectedItemsSubtotal - applicableDiscountAmount;
        return total < 0 ? 0 : total;

    }, [calculatedCart, selectedItems, currentCartItems, allSelected]);


    // =================================================================
    // ============ 🚀 HÀM ĐÃ ĐƯỢC CẬP NHẬT 🚀 ======================
    // =================================================================
    const handleConfirmOrder = async () => {

        // (1) Lấy danh sách các item được CHỌN
        const selectedCartItems = currentCartItems.filter(
            (item) => selectedItems[item.bookId]
        );

        // (2) Map data cho trang /orderdetail (như cũ)
        const selectedBooksData = selectedCartItems.map(item => ({
            bookId: item.bookId,
            bookName: item.bookName,
            bookImage: item.bookImages ? item.bookImages[0] : null,
            quantity: item.quantity,
            price: item.originalPrice
        }));

        // (3) Validation (như cũ)
        if (selectedBooksData.length === 0) {
            alert("Vui lòng chọn ít nhất một sản phẩm để đặt hàng.");
            return;
        }
        if (!address) {
            alert("Vui lòng cập nhật địa chỉ giao hàng trước khi đặt hàng.");
            return;
        }

        // (4) 🚀 LOGIC MỚI: Gửi tracking "place-order attempt"
        try {
            // (4a) Chuẩn bị payload theo DTO PlaceOrderTrackRequest
            // (DTO: { accountId, totalPrice, items: [{ bookId, quantity, price }] })
            const trackingPayload = {
                accountId: accountId, // Lấy từ localStorage
                totalPrice: finalSelectedTotal, // Lấy từ useMemo
                items: selectedCartItems.map((item) => ({
                    bookId: item.bookId,
                    quantity: item.quantity,
                    price: item.originalPrice, // Đây là đơn giá
                })),
            };

            // (4b) Gửi request POST (fire-and-forget)
            // Chúng ta không await và không chặn người dùng nếu API này lỗi.
            // Việc tracking là "âm thầm", không được ảnh hưởng đến trải nghiệm đặt hàng.
            axios.post(
                "http://localhost:8081/api/analytics/track/place-order",
                trackingPayload
            ).catch((trackError) => {
                // Ghi log lỗi tracking nhưng không dừng việc đặt hàng
                console.error("Lỗi khi gửi tracking 'place-order attempt':", trackError);
            });

        } catch (error) {
            // Catch lỗi đồng bộ (nếu có) khi chuẩn bị payload
            console.error("Lỗi khi chuẩn bị tracking payload:", error);
        }

        // (5) Điều hướng người dùng đến trang chi tiết đơn hàng (như cũ)
        navigate("/orderdetail", {
            state: {
                selectedBooks: selectedBooksData,
                address,
                totalAmount: finalSelectedTotal
            }
        });
    };
    // =================================================================
    // ============ 🚀 KẾT THÚC HÀM CẬP NHẬT 🚀 ======================
    // =================================================================


    return (
        <div className="flex flex-col items-center p-5 w-[90%] mx-auto">
            {loading ? (
                <p className="text-gray-500">Đang tải giỏ hàng...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (!calculatedCart || currentCartItems.length === 0) ? (
                <p className="text-gray-500">Giỏ hàng của bạn đang trống.</p>
            ) : (
                <div className="w-full">
                    <div className="space-y-6">
                        <table className="w-full bg-white shadow-md rounded-lg">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-4 text-left w-12">
                                        <input
                                            type="checkbox"
                                            ref={selectAllRef}
                                            checked={allSelected}
                                            onChange={handleSelectAll}
                                            className="w-5 h-5"
                                        />
                                    </th>
                                    <th className="p-4 text-left">Sách</th>
                                    <th className="p-4 text-left w-40">Số lượng</th>
                                    <th className="p-4 text-left w-48">Thành tiền</th>
                                    <th className="p-4 text-left w-24">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCartItems.map((item) => (
                                    <React.Fragment key={item.bookId}>
                                        <tr className="border-b hover:bg-gray-50">
                                            {/* Checkbox */}
                                            <td className="p-4 align-top">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems[item.bookId] || false}
                                                    onChange={() => toggleSelect(item.bookId)}
                                                    className="w-5 h-5 mt-1"
                                                />
                                            </td>
                                            {/* Item Info */}
                                            <td className="p-4">
                                                <CartItem item={item} />
                                            </td>
                                            {/* Quantity */}
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                                                        className="w-8 h-8 border border-gray-300 cursor-pointer text-lg rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-10 text-lg flex items-center justify-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                                                        className="w-8 h-8 border border-gray-300 cursor-pointer text-lg rounded-md hover:bg-green-100"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            {/* Price */}
                                            <td className="p-4 text-base font-semibold text-red-500 align-middle">
                                                {(item.lineItemTotal).toLocaleString("vi-VN")} VND
                                            </td>
                                            {/* Remove Button */}
                                            <td className="p-4 align-middle">
                                                <button
                                                    className="p-2 flex items-center justify-center bg-red-500 text-white rounded-md shadow hover:bg-red-600 active:bg-red-700 transition-all duration-200"
                                                    onClick={() => removeItem(item.bookId)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 4v6m4-6v6M10 2h4a1 1 0 0 1 1 1v1H9V3a1 1 0 0 1 1-1z"></path>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>

                                        {/* HÀNG GỢI Ý COMBO "CỨNG" (Giữ nguyên) */}
                                        {selectedItems[item.bookId] && comboSuggestions[item.bookId] && comboSuggestions[item.bookId].length > 0 && (
                                            <tr className="bg-yellow-50 border-b border-yellow-200 transition-all duration-300">
                                                <td></td>
                                                <td colSpan="4" className="p-4 text-sm">
                                                    {comboSuggestions[item.bookId].map(combo => {
                                                        const missingBookIds = combo.bookIds.filter(id => id !== item.bookId && !currentCartItems.some(cartItem => cartItem.bookId === id));

                                                        if (missingBookIds.length > 0) {
                                                            return (
                                                                <div key={combo.comboId} className="mb-2 last:mb-0">
                                                                    <div className="mb-2">
                                                                        <span className="font-semibold text-orange-700">💡 Gợi ý combo "{combo.name}":</span>
                                                                        <span className="text-gray-700"> Mua thêm {missingBookIds.length > 1 ? "các sách" : "sách"} sau để được
                                                                            {combo.discountType === 'PERCENT' ? ` giảm ${combo.discountValue}%` : ` giảm ${combo.discountValue.toLocaleString('vi-VN')}₫`}:
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex flex-wrap gap-3">
                                                                        {missingBookIds.map(missingId => {
                                                                            const details = missingBookDetails[missingId];

                                                                            const handleSuggestionClick = () => {
                                                                                navigate(`/productdetail/${missingId}`);
                                                                            };

                                                                            if (details) {
                                                                                return (
                                                                                    <div
                                                                                        key={missingId}
                                                                                        className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                                                                                        onClick={handleSuggestionClick}
                                                                                        title={`Xem chi tiết sách: ${details.name}`}
                                                                                    >
                                                                                        <img
                                                                                            src={details.image || 'https://via.placeholder.com/60x80.png?text=Book'}
                                                                                            alt={details.name}
                                                                                            className="w-14 h-auto object-cover rounded-md shadow-sm"
                                                                                        />
                                                                                        <span className="text-sm font-medium text-blue-700 hover:underline">
                                                                                            {details.name}
                                                                                        </span>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                            else {
                                                                                return (
                                                                                    <div key={missingId} className="flex items-center gap-2 p-2 bg-gray-100 border border-gray-200 rounded-lg">
                                                                                        <div className="w-14 h-[84px] bg-gray-300 rounded-md animate-pulse"></div>
                                                                                        <span className="text-sm text-gray-500">
                                                                                            Đang tải...
                                                                                        </span>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                </td>
                                            </tr>
                                        )}

                                        {/* --- HÀNG MỚI CHO GỢI Ý HOT_SELLER --- */}
                                        {selectedItems[item.bookId] && hotSellerSuggestions[item.bookId] && hotSellerSuggestions[item.bookId].length > 0 && (
                                            <tr className="bg-blue-50 border-b border-blue-200 transition-all duration-300">
                                                <td></td> {/* Cột checkbox */}
                                                <td colSpan="4" className="p-4 text-sm">
                                                    <div className="mb-2">
                                                        <span className="font-semibold text-blue-700">🔥 Mua kèm sách HOT:</span>
                                                        <span className="text-gray-700"> Mua thêm 1 trong các sách sau để được <b className="text-red-600">giảm 50%</b> cho sách đó:</span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3">
                                                        {hotSellerSuggestions[item.bookId].map(suggestion => {

                                                            const handleSuggestionClick = () => {
                                                                navigate(`/productdetail/${suggestion.id}`);
                                                            };

                                                            return (
                                                                <div
                                                                    key={suggestion.id}
                                                                    className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                                                                    onClick={handleSuggestionClick}
                                                                    title={`Xem chi tiết sách: ${suggestion.name}`}
                                                                >
                                                                    <img
                                                                        src={suggestion.image || 'https://via.placeholder.com/60x80.png?text=Book'}
                                                                        alt={suggestion.name}
                                                                        className="w-14 h-auto object-cover rounded-md shadow-sm"
                                                                    />
                                                                    <div>
                                                                        <span className="text-sm font-medium text-blue-700 hover:underline block">
                                                                            {suggestion.name}
                                                                        </span>
                                                                        {/* Tùy chọn: Hiển thị giá gốc */}
                                                                        {suggestion.price && (
                                                                            <span className="text-xs text-gray-600 block">
                                                                                Giá: {suggestion.price.toLocaleString('vi-VN')}₫
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PHẦN TỔNG TIỀN (Giữ nguyên) */}
            {calculatedCart && currentCartItems.length > 0 && (
                <div className="cart-total sticky bottom-0 w-full bg-green-100 p-4 rounded-t-lg flex flex-col items-center z-10 mt-5 shadow-inner">
                    <div className="w-full max-w-md space-y-2 mb-4">
                        <div className="flex justify-between text-lg">
                            <span>Tạm tính ({currentCartItems.reduce((count, item) => selectedItems[item.bookId] ? count + item.quantity : count, 0)} sản phẩm):</span>
                            <span>
                                {currentCartItems.reduce((sum, item) => selectedItems[item.bookId] ? sum + item.lineItemTotal : sum, 0).toLocaleString("vi-VN")} VND
                            </span>
                        </div>

                        {allSelected && calculatedCart.appliedDiscounts && calculatedCart.appliedDiscounts.length > 0 && (
                            <>
                                <hr className="border-gray-300" />
                                <div className="text-green-600 font-semibold">Khuyến mãi đã áp dụng:</div>
                                {calculatedCart.appliedDiscounts.map((discount, index) => (
                                    <div key={index} className="flex justify-between text-green-700">
                                        <span>- {discount.discountName}:</span>
                                        <span>- {discount.amount.toLocaleString("vi-VN")} VND</span>
                                    </div>
                                ))}
                                <hr className="border-gray-300" />
                            </>
                        )}

                        <div className="flex justify-between text-xl font-bold text-red-600 pt-2">
                            <span>Tổng cộng:</span>
                            <span>{finalSelectedTotal.toLocaleString("vi-VN")} VND</span>
                        </div>
                    </div>

                    <button
                        className="mt-4 !bg-green-600 text-white py-3 px-6 !rounded-lg !shadow-lg hover:scale-105 hover:bg-green-700 transition-all duration-300 disabled:opacity-50 !disabled:cursor-not-allowed !text-lg !font-semibold w-80 !text-center"
                        disabled={!someSelected || finalSelectedTotal === 0}
                        onClick={handleConfirmOrder}
                    >
                        {!someSelected ? "Chọn sản phẩm để thanh toán" : "Xác nhận đặt hàng"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cart;