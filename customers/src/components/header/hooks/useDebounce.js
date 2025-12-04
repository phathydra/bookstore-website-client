import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  // State để lưu giá trị đã bị trì hoãn
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Thiết lập một timer
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Đây là hàm dọn dẹp (cleanup)
      // Nó sẽ hủy timer cũ trước khi thiết lập timer mới
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Chỉ chạy lại effect này nếu value hoặc delay thay đổi
  );

  return debouncedValue;
}