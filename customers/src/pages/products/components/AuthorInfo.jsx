// src/products/components/AuthorInfo.js
import React from "react";

const AuthorInfo = ({ authorDetails }) => {
  if (!authorDetails) return null;

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
      {/* Tiêu đề */}
      <h2 className="text-2xl font-bold text-blue-600 mb-4">
        Thông tin tác giả
      </h2>

      {/* Hình + Thông tin cơ bản */}
      <div className="flex flex-col md:flex-row gap-6">
        {authorDetails.imageUrl && (
          <div className="md:w-1/3">
            <img
              src={authorDetails.imageUrl}
              alt={authorDetails.name}
              className="w-full rounded-xl shadow-md object-cover"
            />
          </div>
        )}
        <div className="md:w-2/3 space-y-2">
          <p><span className="font-semibold">Tên:</span> {authorDetails.name}</p>
          <p><span className="font-semibold">Ngày sinh:</span> {authorDetails.birthDate}</p>
          <p><span className="font-semibold">Nơi sinh:</span> {authorDetails.birthPlace}</p>
          <p><span className="font-semibold">Nghề nghiệp:</span> {authorDetails.occupation?.join(", ")}</p>
          <p><span className="font-semibold">Thể loại:</span> {authorDetails.genre?.join(", ")}</p>
        </div>
      </div>

      {/* Tiểu sử */}
      {authorDetails.biography && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Tiểu sử</h3>
          <p className="text-gray-700 leading-relaxed">{authorDetails.biography}</p>
        </div>
      )}

      {/* Tác phẩm nổi bật */}
      {authorDetails.notableWorks && authorDetails.notableWorks.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Tác phẩm nổi bật</h3>
          <ul className="list-disc list-inside space-y-1">
            {authorDetails.notableWorks.map((work, index) => (
              <li key={index} className="text-gray-700">
                <span className="font-medium">{work.title}</span> 
                {" "}({work.type}, {work.year})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Giải thưởng */}
      {authorDetails.awards && authorDetails.awards.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Giải thưởng</h3>
          <ul className="list-disc list-inside space-y-1">
            {authorDetails.awards.map((award, index) => (
              <li key={index} className="text-gray-700">
                <span className="font-medium">{award.name}</span> ({award.year})
                {award.work && <> – cho tác phẩm <em>{award.work}</em></>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Liên kết ngoài */}
      {authorDetails.externalLinks && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Liên kết ngoài</h3>
          <div className="flex flex-wrap gap-4">
            {authorDetails.externalLinks.wikipedia && (
              <a
                href={authorDetails.externalLinks.wikipedia}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Wikipedia
              </a>
            )}
            {authorDetails.externalLinks.goodreads && (
              <a
                href={authorDetails.externalLinks.goodreads}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Goodreads
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorInfo;
