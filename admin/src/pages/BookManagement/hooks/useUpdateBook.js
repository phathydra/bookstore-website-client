import { useState, useEffect } from "react";
import { uploadImage, updateBook } from "../services/bookService";

export const useUpdateBook = (book, onClose, onUpdate) => {
  const [formData, setFormData] = useState({
    bookId: "",
    bookName: "",
    bookAuthor: "",
    bookPrice: "",
    mainCategory: "",
    bookCategory: "",
    bookYearOfProduction: "",
    bookPublisher: "",
    bookLanguage: "",
    bookStockQuantity: "",
    bookSupplier: "",
    bookDescription: "",
    bookImages: [],
  });

  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load dữ liệu sách vào form khi mở modal
  useEffect(() => {
    if (book) {
      setFormData({ ...book, bookImages: book.bookImages || [] });
      if (book.bookImages && book.bookImages.length > 0) {
        setImagePreviewUrls(book.bookImages);
      } else {
        setImagePreviewUrls([]);
      }
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setError("");

    if (name === "bookImages" && files) {
      const fileArray = Array.from(files);
      const newPreviewUrls = fileArray.map((file) => URL.createObjectURL(file));

      // Cập nhật cả formData và imagePreviewUrls bằng cách nối thêm vào mảng cũ
      setFormData((prev) => ({
        ...prev,
        bookImages: [...(prev.bookImages || []), ...fileArray],
      }));
      setImagePreviewUrls((prev) => [...(prev || []), ...newPreviewUrls]);
    } else if (name === "mainCategory") {
      setFormData((prev) => ({ ...prev, mainCategory: value, bookCategory: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Thêm hàm mới để xóa ảnh
  const handleDeleteImage = (index) => {
    // Giải phóng URL tạm thời để tránh rò rỉ bộ nhớ
    if (imagePreviewUrls[index] instanceof URL) {
      URL.revokeObjectURL(imagePreviewUrls[index]);
    }

    // Lọc bỏ ảnh khỏi mảng formData và imagePreviewUrls
    setFormData((prev) => {
      const newImages = prev.bookImages.filter((_, i) => i !== index);
      return { ...prev, bookImages: newImages };
    });
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Tách các ảnh có sẵn (URL) và các file ảnh mới cần upload
      const existingImages = formData.bookImages.filter((item) => typeof item === "string");
      const newFilesToUpload = formData.bookImages.filter((item) => item instanceof File);

      let newImageUrls = [];
      if (newFilesToUpload.length > 0) {
        for (let file of newFilesToUpload) {
          const url = await uploadImage(file);
          newImageUrls.push(url);
        }
      }

      const allImageUrls = [...existingImages, ...newImageUrls];

      const updatedBook = {
        ...formData,
        bookPrice: parseFloat(formData.bookPrice) || 0,
        bookYearOfProduction: parseInt(formData.bookYearOfProduction) || 0,
        bookStockQuantity: parseInt(formData.bookStockQuantity) || 0,
        bookImages: allImageUrls,
      };

      // ================================================================
      // DÒNG SỬA DUY NHẤT LÀ ĐÂY:
      // Dùng để kiểm tra xem `mainCategory` đã được cập nhật đúng
      // trong state `formData` trước khi gửi đi hay chưa.
      console.log("Dữ liệu gửi lên server (Kiểm tra mainCategory):", updatedBook);
      // ================================================================

      const res = await updateBook(updatedBook);

      onUpdate(res.data);
      onClose();
      // Để đảm bảo dữ liệu mới nhất được hiển thị
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error(err);
      setError("Lỗi khi cập nhật sách. Vui lòng kiểm tra dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    imagePreviewUrls,
    isLoading,
    error,
    handleChange,
    handleUpdate,
    handleDeleteImage, // Thêm hàm xóa ảnh vào return
  };
};