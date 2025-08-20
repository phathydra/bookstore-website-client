import axios from "axios";

const API_BASE = "http://localhost:8081/api/book";

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "Upload_image");
  formData.append("cloud_name", "dfsxqmwkz");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dfsxqmwkz/image/upload",
    { method: "POST", body: formData }
  );
  const data = await response.json();
  return data.secure_url || null;
};

export const addBook = async (bookData) => axios.post(API_BASE, bookData);

export const updateBook = async (bookData) =>
  axios.put(`${API_BASE}/${bookData.bookId}`, bookData);

export const importBooksFromExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(`${API_BASE}/import`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
