import { useState } from "react";

export const useBookDetail = () => {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const handleOpenUpdateModal = () => setOpenUpdateModal(true);
  const handleCloseUpdateModal = () => setOpenUpdateModal(false);

  return {
    openUpdateModal,
    handleOpenUpdateModal,
    handleCloseUpdateModal,
  };
};
