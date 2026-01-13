// src/components/Subject.jsx
import React from 'react';

const categories = [
  "Review khóa học",
  "Chia sẻ kinh nghiệm",
  "Tips & Tricks",
  "Front-end / MobileApp",
  "Back-end / DevOps",
  "UI/UX/Design",
  "Others"
];

const Subject = () => {
  return (
    <div className="flex flex-col px-4 py-8 bg-zinc-900 max-md:max-w-full">
      <h3 className="text-lg font-semibold text-white mb-4 w-full">XEM CÁC BÀI VIẾT THEO CHỦ ĐỀ</h3>
      <ul className="space-y-3">
        {categories.map((cat, index) => (
          <li key={index}>
            <button className="flex gap-2.5 items-start self-start p-2.5 text-xl font-normal text-white rounded-lg bg-white bg-opacity-10 hover:bg-gray-800 transition">
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Subject;