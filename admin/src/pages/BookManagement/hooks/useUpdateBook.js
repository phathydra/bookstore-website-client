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
    bookImage: null,
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // load book vào form khi mở modal
  useEffect(() => {
    if (book) {
      setFormData(book);
      if (book.bookImage) setImagePreviewUrl(book.bookImage);
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "bookImage" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, bookImage: file }));
      setImagePreviewUrl(URL.createObjectURL(file));
    } else if (name === "mainCategory") {
      setFormData((prev) => ({ ...prev, mainCategory: value, bookCategory: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    }
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.bookImage;

      if (formData.bookImage instanceof File) {
        imageUrl = await uploadImage(formData.bookImage);
      }

      const updatedBook = { ...formData, bookImage: imageUrl || "" };
      const res = await updateBook(updatedBook);

      onUpdate(res.data);
      onClose();
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error(err);
      setError("Error updating book.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    imagePreviewUrl,
    isLoading,
    error,
    handleChange,
    handleUpdate,
  };
};
