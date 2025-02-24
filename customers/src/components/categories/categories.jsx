import React from "react";
import "./categories.css";

const Categories = () => {
    return (
        <>
            <p className="filter-title">Bộ lọc</p>
            <div className="category-container">
                <p className="category-title">Giá</p>
                <label>
                    <input type="radio" name="price" value="1-100000" />
                    1 - 100,000 VND
                </label>
                <label>
                    <input type="radio" name="price" value="100000-1000000" />
                    100,000 - 1,000,000 VND
                </label>
                <label>
                    <input type="radio" name="price" value="other" />
                    ? - ? VND
                </label>
            </div>
            <div className="category-container">
                <p className="category-title">Thể loại</p>
                <label>
                    <input type="checkbox" value="trinh-tham" />
                    Trinh thám
                </label>
                <label>
                    <input type="checkbox" value="kinh-di" />
                    Kinh dị
                </label>
                <label>
                    <input type="checkbox" value="khoa-hoc" />
                    Khoa học
                </label>
                <label>
                    <input type="checkbox" value="other" />
                    ...
                </label>
            </div>
        </>
    );
};

export default Categories;