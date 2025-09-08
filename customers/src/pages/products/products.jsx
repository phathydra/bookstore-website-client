import { useState, useEffect } from "react";
import Book from "../../components/book/book";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Range } from "react-range";
import { mainCategories } from "../../constant";

const Products = () => {
  const { categoryName } = useParams();
  const [books, setBooks] = useState({});
  const [authorDetails, setAuthorDetails] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [pagesArr, setPagesArr] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [openCategories, setOpenCategories] = useState([]);
  const [selectedPublishers, setSelectedPublishers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParam = new URLSearchParams(location.search);
  const searchInput = searchParam.get("searchParam");
  const publisherParam = searchParam.get("bookPublisher");
  const supplierParam = searchParam.get("bookSupplier");
  const authorrParam = searchParam.get("bookAuthor");
  const [authorFilter, setAuthorFilter] = useState("");

  console.log("Category Name from URL:", categoryName);

  useEffect(() => { 
    if (categoryName) {
      if (mainCategories[categoryName]) {
        setSelectedCategories((prev) =>
          prev.includes(categoryName) ? prev : [...prev, categoryName]
        );
        setOpenCategories((prev) =>
          prev.includes(categoryName) ? prev : [...prev, categoryName]
        );
      } else {
        let foundMainCategory = null;
        for (const [mainCategory, subCategories] of Object.entries(mainCategories)) {
          if (subCategories.includes(categoryName)) {
            foundMainCategory = mainCategory;
            break;
          }
        }
        if (foundMainCategory) {
          setSelectedSubCategories((prev) =>
            prev.includes(categoryName) ? prev : [...prev, categoryName]
          );
          setSelectedCategories((prev) =>
            prev.includes(foundMainCategory) ? prev : [...prev, foundMainCategory]
          );
          setOpenCategories((prev) =>
            prev.includes(foundMainCategory) ? prev : [...prev, foundMainCategory]
          );
        }
      }
    }
  }, [categoryName]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const url = `http://localhost:8081/api/book/filter`;

        const body = {
          bookAuthor: authorrParam || authorFilter,
          mainCategory: selectedCategories,
          bookCategory: selectedSubCategories,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          bookPublisher: publisherParam ? [publisherParam] : selectedPublishers,
          bookSupplier: supplierParam ? [supplierParam] : selectedSuppliers,
        };

        const response = await axios.post(url, {
          params: { page, size },
          data: body,
        });

        setBooks(response.data);

        setPagesArr(
          page === 0
            ? response.data.totalPages === 1
              ? [0]
              : [0, 1]
            : page === response.data.totalPages - 1
            ? [page - 1, page]
            : [page - 1, page, page + 1]
        );
      } catch (e) {
        console.error("Lỗi khi tải sách:", e);
      }
    };
    fetchBooks();
  }, [
    page,
    size,
    searchInput,
    selectedCategories,
    selectedSubCategories,
    selectedPublishers,
    selectedSuppliers,
    priceRange,
    authorFilter,
    publisherParam,
    supplierParam,
    authorrParam,
  ]);

  useEffect(() => {
    const fetchAuthorDetails = async () => {
      const authorToFetch = authorrParam || authorFilter;
      if (authorToFetch) {
        try {
          const response = await axios.get(
            `http://localhost:8081/api/author/${encodeURIComponent(authorToFetch)}`
          );
          setAuthorDetails(response.data);
        } catch (e) {
          console.error("Lỗi khi tải thông tin tác giả:", e);
          setAuthorDetails(null);
        }
      } else {
        setAuthorDetails(null);
      }
    };

    fetchAuthorDetails();
  }, [authorrParam, authorFilter]);

  const clearSearchParams = (newAuthor) => {
    const currentParams = new URLSearchParams(location.search);
    currentParams.delete("searchParam");
    currentParams.delete("bookPublisher");
    currentParams.delete("bookSupplier");
    currentParams.set("bookAuthor", newAuthor || "");
    navigate(`${location.pathname}?${currentParams.toString()}`);
  };

  const toggleSelection = (value, setState, state) => {
    setState(state.includes(value) ? state.filter((v) => v !== value) : [...state, value]);
    clearSearchParams();
  };

  const handleMainCategoryChange = (category) => {
    const isChecked = selectedCategories.includes(category);
    let newSelectedCategories = [...selectedCategories];
    let newSelectedSubCategories = [...selectedSubCategories];
    let newOpenCategories = [...openCategories];

    if (isChecked) {
      // Uncheck main category and its subcategories
      newSelectedCategories = newSelectedCategories.filter((c) => c !== category);
      newSelectedSubCategories = newSelectedSubCategories.filter(
        (sub) => !mainCategories[category].includes(sub)
      );
      newOpenCategories = newOpenCategories.filter((c) => c !== category);
    } else {
      // Check main category and open its subcategories
      newSelectedCategories.push(category);
      newOpenCategories.push(category);
    }

    setSelectedCategories(newSelectedCategories);
    setSelectedSubCategories(newSelectedSubCategories);
    setOpenCategories(newOpenCategories);
    clearSearchParams();
  };

  const handleSubCategoryChange = (subCategory, mainCategory) => {
    toggleSelection(subCategory, setSelectedSubCategories, selectedSubCategories);
  };

  const handleAuthorFilterChange = (e) => {
    setAuthorFilter(e.target.value);
    clearSearchParams(e.target.value);
  };

  const handlePriceRangeChange = (values) => {
    setPriceRange(values);
    clearSearchParams();
  };

  const renderCheckboxFilter = (title, items, selected, setSelected) => (
    <div className="mb-4 text-left">
      <h3 className="font-semibold !text-xl mb-2">{title}</h3>
      <div className="flex flex-col !space-y-2">
        {items.map((item) => (
          <div key={item} className="flex flex-col">
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={selected.includes(item)}
                onChange={() => handleMainCategoryChange(item)}
                className="cursor-pointer mt-1 !mr-2"
              />
              <span className="leading-6">{item}</span>
            </div>
            {openCategories.includes(item) && (
              <div className="ml-6 mt-2 flex flex-col space-y-1">
                {mainCategories[item].map((subCategory) => (
                  <div key={subCategory} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedSubCategories.includes(subCategory)}
                      onChange={() => handleSubCategoryChange(subCategory, item)}
                      className="cursor-pointer mt-1 !mr-2"
                    />
                    <span className="leading-6">{subCategory}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-[20%_1fr] w-full !p-4 bg-white">
      <div className="!p-5 bg-gray-100 !border-r !border-gray-300">
        <h2 style={{ color: "red" }} className="!text-3xl mb-3">
          LỌC THEO
        </h2>
        <div className="border-b border-gray-300 pb-3 mb-4"></div>
        <div className="mb-4 text-left">
          <h3 className="font-semibold !text-xl mb-2">TÁC GIẢ</h3>
          <input
            type="text"
            value={authorrParam || authorFilter}
            onChange={handleAuthorFilterChange}
            placeholder="Nhập tên tác giả"
            className="border p-2 w-full"
          />
        </div>
        {renderCheckboxFilter(
          "DANH MỤC CHÍNH",
          Object.keys(mainCategories),
          selectedCategories,
          setSelectedCategories
        )}
        <div className="mb-4 text-left">
          <h3 className="font-semibold !text-xl mb-2">GIÁ</h3>
          <div className="flex flex-col space-y-2">
            {[
              [0, 150000],
              [150000, 300000],
              [300000, 500000],
              [500000, 700000],
              [700000, 1000000],
            ].map(([min, max]) => (
              <div key={`${min}-${max}`} className="flex items-start">
                <input
                  type="checkbox"
                  checked={priceRange[0] === min && priceRange[1] === max}
                  onChange={() => {
                    setPriceRange([min, max]);
                    clearSearchParams();
                  }}
                  className="cursor-pointer mt-1 !mr-2"
                />
                <span className="leading-6">
                  {min.toLocaleString()}đ - {max.toLocaleString()}đ
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4">Hoặc chọn mức giá phù hợp</p>
          <div className="mt-2">
            <Range
              step={1000}
              min={0}
              max={1000000}
              values={priceRange}
              onChange={handlePriceRangeChange}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: "6px",
                    width: "100%",
                    backgroundColor: "#ccc",
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props, key }) => (
                <div
                  style={{
                    ...props.style,
                    height: "20px",
                    width: "20px",
                    backgroundColor: "#999",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      height: "10px",
                      width: "10px",
                      backgroundColor: "#fff",
                      borderRadius: "50%",
                    }}
                  />
                </div>
              )}
            />
            <div className="text-center text-sm mt-2">
              {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
            </div>
          </div>
        </div>
        {renderCheckboxFilter(
          "NHÀ XUẤT BẢN",
          [
            "NXB Trẻ",
            "NXB Kim Đồng",
            "NXB Giáo dục Việt Nam",
            "NXB Chính trị quốc gia Sự thật",
            "NXB Tổng hợp Thành phố Hồ Chí Minh",
            "NXB Phụ nữ Việt Nam",
            "NXB Hội Nhà văn",
            "NXB Lao động",
            "NXB Dân trí",
            "NXB Văn học",
            "NXB Khoa học xã hội",
            "NXB Đại học Quốc gia Hà Nội",
            "NXB Thế Giới",
          ],
          selectedPublishers,
          setSelectedPublishers
        )}
        {renderCheckboxFilter(
          "NHÀ CUNG CẤP",
          [
            "Nhã Nam",
            "Alpha Books",
            "Megabooks",
            "Kim Đồng",
            "Kinokuniya Book Stores",
            "NXB Trẻ",
            "Đinh Tị",
            "AZ Việt Nam",
            "Tân Việt",
          ],
          selectedSuppliers,
          setSelectedSuppliers
        )}
      </div>
      <div className="p-5 w-full bg-green-50">
        {(authorrParam || authorFilter) && authorDetails && (
          <div className="bg-blue-100 p-4 rounded-lg mb-4">
            <h3 className="font-semibold !text-xl mb-2">Thông tin tác giả</h3>
            <p>
              <strong>Tên:</strong> {authorDetails.name}
            </p>
            <p>
              <strong>Ngày sinh:</strong> {authorDetails.birthDate}
            </p>
            <p>
              <strong>Nơi sinh:</strong> {authorDetails.birthPlace}
            </p>
            <p>
              <strong>Nghề nghiệp:</strong>{" "}
              {authorDetails.occupation?.join(", ")}
            </p>
            <p>
              <strong>Thể loại:</strong> {authorDetails.genre?.join(", ")}
            </p>
            <p>
              <strong>Tiểu sử:</strong> {authorDetails.biography}
            </p>
            {authorDetails.imageUrl && (
              <img
                src={authorDetails.imageUrl}
                alt={authorDetails.name}
                className="w-full h-auto mt-2 rounded"
              />
            )}
            {authorDetails.awards?.length > 0 && (
              <div className="mt-2">
                <strong>Giải thưởng:</strong>
                <ul className="list-disc ml-4">
                  {authorDetails.awards.map((award, index) => (
                    <li key={index}>
                      {award.year}: {award.awardName}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {authorDetails.notableWorks?.length > 0 && (
              <div className="mt-2">
                <strong>Tác phẩm nổi bật:</strong>
                <ul className="list-disc ml-4">
                  {authorDetails.notableWorks.map((work, index) => (
                    <li key={index}>
                      {work.title} ({work.year})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {authorDetails.externalLinks && (
              <div className="mt-2">
                <strong>Liên kết ngoài:</strong>
                <ul className="list-disc ml-4">
                  {Object.entries(authorDetails.externalLinks).map(([key, value]) => (
                    <li key={key}>
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {key}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end items-center mb-4">
          <label htmlFor="size-select" className="mr-2 text-gray-700">
            Số lượng mỗi trang:
          </label>
          <select
            id="size-select"
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[12, 24, 60, 120].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {(books?.content || []).map((book, index) => (
            <Book book={book} key={index} />
          ))}
        </div>
        {books.totalPages > 0 && (
          <div className="mt-5">
            <div className="text-center mb-2 text-gray-7000">
              Trang {books.number + 1} / {books.totalPages}
            </div>
            <div className="flex justify-center items-center space-x-2">
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300"
                disabled={books.first}
                onClick={() => setPage(page - 1)}
              >
                {"<"}
              </button>
              {pagesArr.map((number) => (
                <button
                  key={number}
                  className={`py-2 px-4 rounded ${
                    number === books.number
                      ? "bg-gray-300"
                      : "bg-blue-500 text-white hover:bg-blue-700"
                  }`}
                  onClick={() => setPage(number)}
                  disabled={number === books.number}
                >
                  {number + 1}
                </button>
              ))}
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300"
                disabled={books.last}
                onClick={() => setPage(page + 1)}
              >
                {">"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;