import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const FillInfo = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const accountIdFromUrl = searchParams.get('accountId');
    const [user, setUser] = useState({
        accountId: accountIdFromUrl || '',
        name: '',
        phone: '',
        address: '',
        avatar: null,
        email: '',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (accountIdFromUrl) {
                setIsLoading(true);
                try {
                    const response = await fetch(`http://localhost:8080/api/account/fetch?accountId=${accountIdFromUrl}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setUser(prevUser => ({
                        ...prevUser,
                        accountId: accountIdFromUrl,
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        avatar: data.avatar || null,
                    }));
                } catch (error) {
                    console.error('Lỗi khi tải thông tin tài khoản ban đầu:', error);
                    setError('Lỗi khi tải thông tin tài khoản ban đầu.');
                    // navigate('/');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setError('Không tìm thấy ID tài khoản hợp lệ.');
                // navigate('/');
            }
        };

        fetchInitialData();
    }, [accountIdFromUrl, navigate]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUser(prevUser => ({ ...prevUser, [name]: value }));
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        setAvatarFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUser(prevUser => ({ ...prevUser, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        } else {
            setUser(prevUser => ({ ...prevUser, avatar: null }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!user.accountId) {
            setError('Không tìm thấy ID tài khoản. Vui lòng thử lại.');
            return;
        }

        setIsLoading(true);
        const formDataToSend = {
            accountId: user.accountId,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            avatar: user.avatar && typeof user.avatar === 'string' ? user.avatar : null,
        };

        let avatarUrl = null;
        if (avatarFile) {
            setUploadingAvatar(true);
            const avatarFormData = new FormData();
            avatarFormData.append('file', avatarFile);
            avatarFormData.append('upload_preset', 'Upload_image'); // Đảm bảo đây là preset đúng
            avatarFormData.append('cloud_name', 'dfsxqmwkz'); // Đảm bảo đây là cloud name đúng

            try {
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/dfsxqmwkz/image/upload`,
                    {
                        method: 'POST',
                        body: avatarFormData,
                    }
                );

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error.message || 'Failed to upload image to Cloudinary');
                }
                avatarUrl = data.secure_url;
                formDataToSend.avatar = avatarUrl;
            } catch (error) {
                console.error('Lỗi tải ảnh lên Cloudinary:', error);
                setError('Lỗi khi tải ảnh lên.');
                setIsLoading(false);
                setUploadingAvatar(false);
                return;
            } finally {
                setUploadingAvatar(false);
            }
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/account/update-information?accountId=${user.accountId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formDataToSend),
                }
            );

            if (response.ok) {
                setSuccessMessage('Thông tin đã được cập nhật thành công!');
                setError('');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else if (response.status === 400) {
                setError('Cập nhật thông tin thất bại. Dữ liệu không hợp lệ.');
                setSuccessMessage('');
            } else {
                setError('Cập nhật thông tin thất bại. Vui lòng thử lại sau.');
                setSuccessMessage('');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin:', error);
            setError('Đã có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
            setSuccessMessage('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white !p-8 rounded-xl !shadow-lg !w-full max-w-md">
                <h2 className="!text-3xl !font-semibold !mb-6 text-center text-indigo-600">Điền thông tin cá nhân</h2>
                {error && <p className="text-red-500 !mb-4 !text-center">{error}</p>}
                {successMessage && <p className="text-green-500 !mb-4 text-center">{successMessage}</p>}
                {user.accountId && (
                    <form onSubmit={handleSubmit} className="!space-y-6"> {/* Tăng khoảng cách giữa các phần tử form */}
                        <div className="flex flex-col items-center !mb-4"> {/* Container cho ảnh và nút tải lên */}
                            <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-md">
                                <img
                                    src={user.avatar || "https://via.placeholder.com/128"}
                                    alt="Avatar preview"
                                    className="w-full h-full object-cover"
                                />
                                <label htmlFor="avatar" className="absolute inset-0 bg-black !bg-opacity-50 flex items-center justify-center text-white text-sm font-medium cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    Đổi ảnh
                                </label>
                                <input
                                    type="file"
                                    id="avatar"
                                    name="avatar"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            {uploadingAvatar && <p className="text-gray-500 text-sm mt-1">Đang tải...</p>}
                        </div>
                        <div className="!mb-4"> {/* Thêm margin bottom cho các input group */}
                            <label htmlFor="email" className="block text-gray-700 text-sm font-bold !mb-2">
                                Email:
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={user.email}
                                className="shadow appearance-none border !rounded w-full !py-2 !px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200 cursor-not-allowed"
                                readOnly
                            />
                        </div>
                        <div className="!mb-4">
                            <label htmlFor="name" className="block text-gray-700 text-sm font-bold !mb-2">
                                Họ và tên:
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={user.name}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full !py-2 !px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div className="!mb-4">
                            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold !mb-2">
                                Số điện thoại:
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={user.phone}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full !py-2 !px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="!mb-4">
                            <label htmlFor="address" className="block text-gray-700 text-sm font-bold !mb-2">
                                Địa chỉ:
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={user.address}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full !py-2 !px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full !py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FillInfo;