import { useState } from "react";
import { uploadImage, addBook, importBooksFromExcel } from "../services/bookService";

export const useAddBook = (onClose) => {
  const [formData, setFormData] = useState({
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
    bookImage: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [excelFile, setExcelFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "bookImage" && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviewUrl(reader.result);
      reader.readAsDataURL(file);
      setFormData({ ...formData, bookImage: file });
    } else if (name === "mainCategory") {
      setFormData({ ...formData, [name]: value, bookCategory: "" });
    } else {
      setFormData({ ...formData, [name]: files ? files[0] : value });
    }
    setError("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let imageUrl = formData.bookImage;

      // Nếu là file ảnh, upload trước và lấy URL
      if (formData.bookImage instanceof File) {
        imageUrl = await uploadImage(formData.bookImage); // uploadImage phải trả URL string
      }

      // Chuyển các trường số từ string sang number
      const payload = {
        ...formData,
        bookPrice: parseFloat(formData.bookPrice) || 0,
        bookYearOfProduction: parseInt(formData.bookYearOfProduction) || 0,
        bookStockQuantity: parseInt(formData.bookStockQuantity) || 0,
        bookImage: imageUrl || "",
      };

      await addBook(payload);

      // Đóng modal và reload
      onClose();
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error(err);
      setError("Lỗi khi thêm sách. Vui lòng kiểm tra dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleExcelChange = (e) => setExcelFile(e.target.files[0]);

  const handleImport = async () => {
    if (!excelFile) {
      setError("Vui lòng chọn file Excel để import.");
      return;
    }
    try {
      await importBooksFromExcel(excelFile);
      alert("Import sách thành công!");
      onClose();
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error(err);
      setError("Lỗi khi import file Excel.");
    }
  };

  return {
    formData,
    setFormData,
    isLoading,
    error,
    imagePreviewUrl,
    excelFile,
    handleChange,
    handleAdd,
    handleExcelChange,
    handleImport,
  };
};
