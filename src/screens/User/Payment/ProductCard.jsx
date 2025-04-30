import * as React from "react";

export default function ProductCard({ title, duration, price, imageUrl }) {
  return (
    <section className="flex overflow-hidden flex-wrap gap-6 justify-center items-center p-3 w-full leading-none bg-[#EBF1F9] border border-solid border-slate-300 h-full max-md:max-w-full">
      <img
        loading="lazy"
        src={imageUrl}
        alt={title}
        className="object-cover w-[120px] lg:max-w[195px] shrink-0 self-stretch my-auto aspect-[1]"
      />
      <div className="flex flex-col flex-1 shrink self-stretch items-center my-auto basis-0 max-md:max-w-full">
        <div className="flex flex-wrap  px-2 py-3 pb-10 w-full text-[1.75rem] max-lg:text-[16px] font-semibold text-[#131313] max-lg:max-w-full">
          <h2 className="flex-1 shrink self-center w-full ">{title}</h2>
        </div>
        <div className="flex flex-col items-start py-[12px] gap-[16px] w-full font-medium max-md:max-w-full">
          <div className="flex gap-3 items-center px-3 max-w-full text-[1.35rem] max-lg:text-[12px] text-[#131313]">
            <p>Thời gian: {duration}</p>
          </div>
          <div className="flex gap-3 items-center px-3 max-w-full h-5 max-lg:h-[20px] font-[600] text-[2rem] max-lg:text-[18px] text-[#DF322B] whitespace-nowrap">
            <p>{price.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
