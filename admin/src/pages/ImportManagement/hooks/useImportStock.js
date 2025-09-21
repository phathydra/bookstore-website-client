import { useState } from "react";
import { importStock, importBooksFromExcel } from "../services/importService";

export const useImportStock = (onClose) => {
  const [books, setBooks] = useState([{ bookName: "", bookAuthor: "", bookStockQuantity: "" }]);
  const [excelFile, setExcelFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const newBooks = [...books];
    newBooks[index] = { ...newBooks[index], [name]: value };
    setBooks(newBooks);
  };

  const handleAddRow = () => {
    setBooks([...books, { bookName: "", bookAuthor: "", bookStockQuantity: "" }]);
  };

  const handleRemoveRow = (index) => {
    const newBooks = books.filter((_, i) => i !== index);
    setBooks(newBooks);
  };

  const handleManualImport = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const validBooks = books.filter(book => book.bookName && book.bookAuthor && book.bookStockQuantity);
    if (validBooks.length === 0) {
      setError("Vui lòng nhập ít nhất một cuốn sách hợp lệ.");
      setIsLoading(false);
      return;
    }

    try {
      await importStock(validBooks.map(book => ({
        ...book,
        bookStockQuantity: parseInt(book.bookStockQuantity, 10)
      })));
      alert("Nhập kho thủ công thành công!");
      onClose(); // Đóng modal hoặc chuyển hướng
    } catch (err) {
      console.error('Error importing stock:', err);
      setError("Lỗi khi nhập kho. Vui lòng kiểm tra dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelChange = (e) => {
    setExcelFile(e.target.files[0]);
    setError(null);
  };

  const handleExcelImport = async () => {
    if (!excelFile) {
      setError("Vui lòng chọn file Excel để import.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      await importBooksFromExcel(excelFile);
      alert("Import sách từ Excel thành công!");
      onClose();
    } catch (err) {
      console.error('Error importing from Excel:', err);
      setError("Lỗi khi import file Excel.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    books,
    excelFile,
    isLoading,
    error,
    handleInputChange,
    handleAddRow,
    handleRemoveRow,
    handleManualImport,
    handleExcelChange,
    handleExcelImport,
  };
};