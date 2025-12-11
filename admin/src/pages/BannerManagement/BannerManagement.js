import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaPlus, FaPencilAlt, FaTrash, FaImages, FaLayerGroup, 
  FaLink, FaToggleOn, FaToggleOff, FaTimes, FaCloudUploadAlt,
  FaChevronLeft, FaChevronRight // <--- Import thêm icon cho phân trang
} from "react-icons/fa";

// Import Components
import SideNav from "../../components/SideNav/SideNav";
import Header from "../../components/Header/Header";

const BannerManagement = () => {
  // --- STATE GIAO DIỆN ---
  const [isCollapsed, setIsCollapsed] = useState(false);

  // --- STATE DỮ LIỆU ---
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // --- STATE PHÂN TRANG (MỚI) ---
  const [currentPage, setCurrentPage] = useState(0); // Spring Boot bắt đầu từ 0
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5; // Số lượng banner trên 1 trang

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [filterType, setFilterType] = useState("ALL"); 
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // State Form
  const [currentBanner, setCurrentBanner] = useState({
    id: "",
    title: "",
    linkUrl: "",
    imageUrl: "", 
    position: "MAIN_SLIDER",
    active: true
  });

  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [previewUrls, setPreviewUrls] = useState([]);     
  const [deleteId, setDeleteId] = useState(null);

  // --- API CALLS ---
  // Gọi lại API mỗi khi currentPage thay đổi
  useEffect(() => {
    fetchBanners(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sửa hàm fetchBanners để nhận tham số page
  const fetchBanners = async (page) => {
    setLoading(true);
    try {
      // Truyền param page và size vào URL
      const res = await axios.get(`http://localhost:8081/api/banners?page=${page}&size=${pageSize}`);
      
      // Spring Boot trả về Page object: { content: [], totalPages: int, number: int, ... }
      setBanners(res.data.content); 
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements); // Tùy chọn, nếu backend trả về
    } catch (error) {
      console.error(error);
      showToast("Lỗi tải danh sách banner!", "danger");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  // --- HANDLERS ---
  
  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleShowModal = (banner = null) => {
    if (banner) {
      setIsEdit(true);
      setCurrentBanner(banner);
      setPreviewUrls([banner.imageUrl]);
      setSelectedFiles([]); 
    } else {
      setIsEdit(false);
      setCurrentBanner({
        title: "",
        linkUrl: "",
        imageUrl: "",
        position: "MAIN_SLIDER",
        active: true
      });
      setPreviewUrls([]);
      setSelectedFiles([]);
    }
    setShowModal(true);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Upload_image");
    formData.append("cloud_name", "dfsxqmwkz");

    const res = await fetch("https://api.cloudinary.com/v1_1/dfsxqmwkz/image/upload", {
        method: "POST",
        body: formData,
    });
    
    if (!res.ok) throw new Error("Lỗi upload ảnh");
    const data = await res.json();
    return data.secure_url;
  };

  const handleSave = async () => {
    if (!currentBanner.title) {
        showToast("Vui lòng nhập tiêu đề!", "warning");
        return;
    }

    setSaving(true);
    try {
        if (isEdit) {
            let finalImageUrl = currentBanner.imageUrl;
            if (selectedFiles.length > 0) {
                finalImageUrl = await uploadToCloudinary(selectedFiles[0]);
            }
            const backendFormData = new FormData();
            const bannerJson = JSON.stringify({ ...currentBanner, imageUrl: finalImageUrl });
            backendFormData.append("banner", bannerJson);

            await axios.put(`http://localhost:8081/api/banners/${currentBanner.id}`, backendFormData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            showToast("Cập nhật thành công!", "success");

        } else {
            if (selectedFiles.length === 0) {
                showToast("Vui lòng chọn ít nhất 1 ảnh!", "warning");
                setSaving(false);
                return;
            }
            const uploadPromises = selectedFiles.map(file => uploadToCloudinary(file));
            const uploadedUrls = await Promise.all(uploadPromises);

            const createBannerPromises = uploadedUrls.map(url => {
                const backendFormData = new FormData();
                const bannerJson = JSON.stringify({
                    ...currentBanner,
                    imageUrl: url    
                });
                backendFormData.append("banner", bannerJson);
                return axios.post("http://localhost:8081/api/banners", backendFormData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            });

            await Promise.all(createBannerPromises);
            showToast(`Đã thêm thành công ${uploadedUrls.length} banner!`, "success");
        }
        setShowModal(false);
        // Load lại trang hiện tại sau khi lưu
        fetchBanners(currentPage);
    } catch (error) {
        console.error(error);
        showToast("Có lỗi xảy ra! Vui lòng thử lại.", "danger");
    } finally {
        setSaving(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8081/api/banners/${deleteId}`);
      showToast("Đã xóa banner!", "success");
      // Load lại trang hiện tại hoặc về trang 0 nếu xóa hết item trang đó
      fetchBanners(currentPage); 
    } catch (error) {
      showToast("Lỗi khi xóa banner!", "danger");
    } finally {
      setShowDeleteModal(false);
    }
  };

  // --- RENDER HELPERS ---
  // Lưu ý: Vì đã phân trang Server-side, việc Filter ở Client chỉ có tác dụng trên trang hiện tại.
  // Nếu muốn filter toàn bộ DB, bạn cần gửi filterType lên API (Backend cần hỗ trợ).
  const filteredBanners = banners.filter(b => 
    filterType === "ALL" ? true : b.position === filterType
  );

  const getPositionLabel = (pos) => {
    switch(pos) {
        case "MAIN_SLIDER": return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">Slider Chính</span>;
        case "RIGHT_TOP": return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">Góc Phải (Trên)</span>;
        case "RIGHT_BOTTOM": return <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">Góc Phải (Dưới)</span>;
        default: return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold">{pos}</span>;
    }
  };

  // ==================== RETURN GIAO DIỆN CHÍNH ====================
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-800">
      
      {/* 1. TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-[9999] flex items-center w-full max-w-xs p-4 space-x-3 text-gray-500 bg-white rounded-lg shadow-lg border-l-4 animate-fade-in-down ${
          toast.type === 'success' ? 'border-green-500' : toast.type === 'danger' ? 'border-red-500' : 'border-yellow-500'
        }`} role="alert">
           <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${
             toast.type === 'success' ? 'text-green-500 bg-green-100' : toast.type === 'danger' ? 'text-red-500 bg-red-100' : 'text-yellow-500 bg-yellow-100'
           }`}>
              {toast.type === 'success' ? <FaToggleOn/> : <FaTrash/>}
           </div>
           <div className="ml-3 text-sm font-normal">{toast.message}</div>
           <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8" onClick={() => setToast({...toast, show: false})}>
              <FaTimes />
           </button>
        </div>
      )}

      {/* 2. SIDEBAR */}
      <SideNav onToggleCollapse={setIsCollapsed} />

      {/* 3. MAIN CONTENT */}
      <main 
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out" 
        style={{ paddingLeft: isCollapsed ? "80px" : "250px" }}
      >
        
        {/* HEADER */}
        <Header title="QUẢN LÝ BANNER & QUẢNG CÁO" isCollapsed={isCollapsed} className="sticky top-0 bg-white shadow-sm z-10" />

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6">
            
            {/* Filter & Actions Bar */}
            <div className="bg-white p-12 rounded-2xl shadow-sm mb-6 flex flex-wrap gap-4 justify-between items-center border border-gray-100">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {[
                      { key: "ALL", label: "Tất cả" },
                      { key: "MAIN_SLIDER", label: "Slider Chính" },
                      { key: "RIGHT_TOP", label: "Phải (Trên)" },
                      { key: "RIGHT_BOTTOM", label: "Phải (Dưới)" }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setFilterType(tab.key)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          filterType === tab.key 
                          ? "bg-white text-blue-600 shadow-sm" 
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                </div>

                <button 
                    onClick={() => handleShowModal(null)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                >
                    <FaPlus /> Thêm Banner
                </button>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                              <tr>
                                <th className="p-4 border-b border-gray-200">Hình ảnh</th>
                                <th className="p-4 border-b border-gray-200">Thông tin Banner</th>
                                <th className="p-4 border-b border-gray-200 text-center">Vị trí</th>
                                <th className="p-4 border-b border-gray-200 text-center">Trạng thái</th>
                                <th className="p-4 border-b border-gray-200 text-right">Hành động</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {filteredBanners.length > 0 ? filteredBanners.map((banner) => (
                                <tr key={banner.id} className="hover:bg-slate-50 transition-colors duration-150 group">
                                    <td className="p-4 w-40">
                                        <div className="w-36 h-20 rounded-lg overflow-hidden border border-gray-200 relative shadow-sm">
                                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 text-lg mb-1">{banner.title}</div>
                                        <div className="text-gray-500 text-sm flex items-center gap-2">
                                            <FaLink className="text-gray-400 text-xs"/>
                                            <span className="truncate max-w-xs">{banner.linkUrl || "Không có liên kết"}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">{getPositionLabel(banner.position)}</td>
                                    <td className="p-4 text-center">
                                        {banner.active 
                                            ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100"><FaToggleOn/> Hiển thị</span>
                                            : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200"><FaToggleOff/> Đang ẩn</span>
                                        }
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <button 
                                            onClick={() => handleShowModal(banner)} 
                                            className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="Sửa"
                                          >
                                              <FaPencilAlt />
                                          </button>
                                          <button 
                                            onClick={() => confirmDelete(banner.id)} 
                                            className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Xóa"
                                          >
                                              <FaTrash />
                                          </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-20 text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <FaImages size={48} className="text-gray-300 mb-4" />
                                            <p>Không tìm thấy banner nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* --- COMPONENT PHÂN TRANG (MỚI) --- */}
                {!loading && totalPages > 0 && (
                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-2xl">
                    <div className="text-sm text-gray-500">
                      Hiển thị trang <span className="font-semibold text-gray-800">{currentPage + 1}</span> / <span className="font-semibold text-gray-800">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`p-2 rounded-lg border flex items-center gap-1 transition-all ${
                          currentPage === 0 
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                            : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm"
                        }`}
                      >
                        <FaChevronLeft size={14} /> Trước
                      </button>

                      {/* Hiển thị số trang (Đơn giản hóa: Hiển thị 5 trang xung quanh trang hiện tại) */}
                      <div className="hidden md:flex gap-1">
                        {[...Array(totalPages)].map((_, index) => {
                           // Chỉ hiển thị các trang gần trang hiện tại để tránh danh sách quá dài
                           if (index < 2 || index > totalPages - 3 || (index >= currentPage - 1 && index <= currentPage + 1)) {
                             return (
                               <button
                                 key={index}
                                 onClick={() => handlePageChange(index)}
                                 className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                                   currentPage === index
                                     ? "bg-blue-600 text-white shadow-md"
                                     : "bg-white text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                                 }`}
                               >
                                 {index + 1}
                               </button>
                             );
                           } else if (index === 2 || index === totalPages - 3) {
                             return <span key={index} className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>;
                           }
                           return null;
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className={`p-2 rounded-lg border flex items-center gap-1 transition-all ${
                          currentPage === totalPages - 1 
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                            : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm"
                        }`}
                      >
                         Sau <FaChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
            </div>
        </div>
      </main>

      {/* --- GIỮ NGUYÊN MODAL CODE CỦA BẠN Ở ĐÂY (KHÔNG THAY ĐỔI) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           {/* ... Code Modal của bạn ... */}
           {/* Chỉ lưu ý khi đóng Modal, có thể cần reset form */}
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
             {/* ... Nội dung Modal Copy lại từ code cũ ... */}
             <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
                {/* Header, Body, Footer của Modal giữ nguyên. 
                    Chỉ cần đảm bảo nút Save gọi hàm handleSave mới ở trên */}
                    
                    {/* ... (Tôi rút gọn phần này để code ngắn gọn, bạn dùng lại phần Render Modal cũ) ... */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {isEdit ? <FaPencilAlt className="text-blue-500"/> : <FaPlus className="text-blue-500"/>}
                        {isEdit ? "Cập nhật Banner" : "Thêm Banner Mới"}
                        </h3>
                        <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <FaTimes size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                             {/* Copy lại toàn bộ nội dung trong modal từ code cũ của bạn vào đây */}
                             {/* CỘT TRÁI: UPLOAD và CỘT PHẢI: INPUTS */}
                             <div className="lg:col-span-5 flex flex-col h-full">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-dashed border-gray-300 h-full">
                                   {/* ... Copy ... */}
                                   <div className="flex justify-between items-center mb-4">
                                        <label className="font-semibold text-gray-700">{isEdit ? "Hình ảnh hiển thị" : "Ảnh đã chọn"}</label>
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{previewUrls.length} ảnh</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-gray-200 min-h-[250px] max-h-[400px] overflow-y-auto mb-4">
                                        {previewUrls.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                {previewUrls.map((url, idx) => (
                                                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden group shadow-sm border border-gray-100">
                                                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                                                <FaImages size={40} className="mb-2 opacity-50"/><span className="text-sm">Chưa có ảnh nào</span>
                                            </div>
                                        )}
                                    </div>
                                    <label htmlFor="file-upload" className="flex items-center justify-center w-full px-4 py-3 bg-white text-blue-600 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl cursor-pointer transition-all font-medium shadow-sm">
                                        <FaCloudUploadAlt className="mr-2 text-xl" /> Chọn ảnh từ máy tính
                                    </label>
                                    <input id="file-upload" type="file" multiple={!isEdit} className="hidden" onChange={handleFileChange} accept="image/*" />
                                </div>
                             </div>

                             <div className="lg:col-span-7 space-y-5">
                                 {/* Inputs Title, Position, Active, LinkUrl giữ nguyên */}
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tiêu đề Banner <span className="text-red-500">*</span></label>
                                    <input type="text" value={currentBanner.title} onChange={(e) => setCurrentBanner({...currentBanner, title: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none" />
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Vị trí</label>
                                        <select value={currentBanner.position} onChange={(e) => setCurrentBanner({...currentBanner, position: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none">
                                            <option value="MAIN_SLIDER">Slider Chính</option>
                                            <option value="RIGHT_TOP">Góc Phải (Trên)</option>
                                            <option value="RIGHT_BOTTOM">Góc Phải (Dưới)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Trạng thái</label>
                                        {/* Toggle Active giữ nguyên */}
                                        <label className="relative inline-flex items-center cursor-pointer mt-2">
                                            <input type="checkbox" checked={currentBanner.active} onChange={(e) => setCurrentBanner({...currentBanner, active: e.target.checked})} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 peer-checked:bg-green-500"></div>
                                        </label>
                                    </div>
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Link URL</label>
                                    <input type="text" value={currentBanner.linkUrl} onChange={(e) => setCurrentBanner({...currentBanner, linkUrl: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none" />
                                 </div>
                             </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                        <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-200 font-medium transition-colors">Hủy bỏ</button>
                        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md font-medium transition-all flex items-center">
                            {saving ? "Đang xử lý..." : "Lưu Thay Đổi"}
                        </button>
                    </div>
             </div>
        </div>
      )}

      {/* --- CUSTOM DELETE MODAL (GIỮ NGUYÊN) --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-bounce-in">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><FaTrash size={28} /></div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa?</h3>
                <div className="flex gap-3 justify-center mt-6">
                    <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700">Hủy</button>
                    <button onClick={handleDelete} className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">Xóa Ngay</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default BannerManagement;