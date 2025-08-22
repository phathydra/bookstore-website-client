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
    bookImages: [],   // ⬅️ mảng thay vì 1 ảnh
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]); // nhiều ảnh
  const [excelFile, setExcelFile] = useState(null);

  // Xử lý input change
const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (name === "bookImages" && files) {
    const fileArray = Array.from(files);

    // preview ảnh
    const previewUrls = fileArray.map((file) => URL.createObjectURL(file));

    setFormData({ ...formData, bookImages: [...formData.bookImages, ...fileArray] });
    setImagePreviewUrls([...imagePreviewUrls, ...previewUrls]);
  } else if (name === "mainCategory") {
    setFormData({ ...formData, [name]: value, bookCategory: "" });
  } else {
    setFormData({ ...formData, [name]: files ? files[0] : value });
  }
  setError("");
};


  // Xử lý thêm sách
const handleAdd = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
    let imageUrls = [];

    // Upload từng ảnh
    if (formData.bookImages.length > 0) {
      for (let file of formData.bookImages) {
        if (file instanceof File) {
          const url = await uploadImage(file); // phải trả URL string
          imageUrls.push(url);
        } else {
          imageUrls.push(file);
        }
      }
    }

    const payload = {
      ...formData,
      bookPrice: parseFloat(formData.bookPrice) || 0,
      bookYearOfProduction: parseInt(formData.bookYearOfProduction) || 0,
      bookStockQuantity: parseInt(formData.bookStockQuantity) || 0,
      bookImages: imageUrls,
    };

    await addBook(payload);

    onClose();
    setTimeout(() => window.location.reload(), 500);
  } catch (err) {
    console.error(err);
    setError("Lỗi khi thêm sách. Vui lòng kiểm tra dữ liệu.");
  } finally {
    setIsLoading(false);
  }
};


  // Xử lý import excel
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
    imagePreviewUrls,
    excelFile,
    handleChange,
    handleAdd,
    handleExcelChange,
    handleImport,
  };
};
