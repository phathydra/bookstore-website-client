import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ActivateAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const accountId = searchParams.get('accountId');
  const [status, setStatus] = useState('pending'); // 'pending', 'activating', 'success', 'error'

  const handleActivate = async () => {
    if (accountId) {
      setStatus('activating');
      try {
        const response = await axios.put(`http://localhost:8080/api/account/activate?accountId=${accountId}`);
        if (response.status === 200) {
          setStatus('success');
          alert('Tài khoản đã được kích hoạt thành công! Bạn sẽ được chuyển hướng đến trang điền thông tin.');
          // Chuyển hướng đến trang điền thông tin và truyền accountId
          navigate(`/fill-info?accountId=${accountId}`);
        } else {
          setStatus('error');
          alert('Kích hoạt tài khoản thất bại. Vui lòng thử lại sau.');
        }
      } catch (error) {
        console.error('Lỗi khi kích hoạt tài khoản:', error);
        setStatus('error');
        alert('Kích hoạt tài khoản thất bại. Vui lòng thử lại sau.');
      }
    } else {
      setStatus('error');
      alert('Không tìm thấy ID tài khoản hợp lệ trong đường dẫn.');
      navigate('/');
    }
  };

  useEffect(() => {
    if (!accountId) {
      setStatus('error');
      alert('Đường dẫn kích hoạt không hợp lệ.');
      navigate('/');
    }
  }, [accountId, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-600">Xác nhận tài khoản</h2>
        {status === 'pending' && (
          <div className="space-y-4">
            <p className="text-lg text-gray-700 text-center">Vui lòng nhấn nút bên dưới để xác nhận tài khoản của bạn.</p>
            <button
              onClick={handleActivate}
              className="mx-14 w-3/4 py-3 mb-6 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
            >
              Xác nhận tài khoản
            </button>
          </div>
        )}
        {status === 'activating' && (
          <p className="text-center text-lg text-gray-700 animate-pulse">Đang tiến hành kích hoạt...</p>
        )}
        {status === 'success' && (
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-lg text-green-600 font-semibold">Kích hoạt thành công!</p>
          </div>
        )}
        {status === 'error' && (
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg text-red-600 font-semibold">Kích hoạt thất bại. Vui lòng thử lại sau.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;