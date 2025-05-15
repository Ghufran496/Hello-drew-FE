import React, { useState, useRef, useEffect } from "react";

interface CalendarCarouselProps {
  initialDate?: Date;
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CalendarCarousel: React.FC<CalendarCarouselProps> = ({ initialDate }) => {
  const [startDate, setStartDate] = useState<Date>(initialDate || new Date());
  const [currentDateIndex, setCurrentDateIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateDates = (start: Date): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(start);
      nextDate.setDate(start.getDate() + i);
      dates.push(nextDate);
    }
    return dates;
  };

  const [dates, setDates] = useState<Date[]>(generateDates(startDate));

  useEffect(() => {
    setDates(generateDates(startDate));
    setCurrentDateIndex(0);
  }, [startDate]);

  const handleNext = () => {
    const nextStartDate = new Date(startDate);
    nextStartDate.setDate(startDate.getDate() + 1);
    setStartDate(nextStartDate);
  };

  const handlePrev = () => {
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(startDate.getDate() - 1);
    setStartDate(prevStartDate);
  };

  const isDateSelected = (date: Date, index: number) => {
    return index === currentDateIndex;
  };

  const formatDate = (date: Date): string => {
    return String(date.getDate());
  };

  const getDayOfWeek = (date: Date): string => {
    return daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
  };

  return (
    <div className="relative flex items-center">
      <button
        onClick={handlePrev}
        className="absolute text-[#0357F8] left-0 top-1/2 transform -translate-y-1/2 hover:opacity-80 focus:outline-none"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
        </svg>
      </button>
      <div className="flex items-center justify-center w-full">
        <div
          className="carousel-container flex justify-center items-center overflow-hidden scroll-smooth gap-2"
          ref={containerRef}
        >
          {dates.map((date, index) => (
            <div
              key={index}
              className={`carousel-item flex flex-col items-center justify-center w-[54px] h-[82px] rounded-[100px] border-[2px] shrink-0 text-center font-medium ${
                isDateSelected(date, index)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              style={{ minWidth: "60px", height: "105px" }}
            >
              <div
                className="day-of-week text-xs mb-1 w-[28px] h-[18px] top-[12px] left-[13px]"
                style={{
                  color: isDateSelected(date, index) ? "white" : "inherit",
                }}
                rounded-full
              >
                {getDayOfWeek(date)}
              </div>
              <div
                className="date-number text-sm bg-white m-1 gap-[20px] w-[35px] top-[38px] left-[9px] h-[35px] rounded-[100px] pt-[10px] pr-[10px] pb-[6px] pl-[10px] text-[#0357F8]"
                style={{
                  color: isDateSelected(date, index) ? "black" : "#0357F8",
                }}
              >
                {formatDate(date)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={handleNext}
        className="absolute text-[#0357F8] right-0 top-1/2 transform -translate-y-1/2 p-2 hover:opacity-80 focus:outline-none"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
        </svg>
      </button>
    </div>
  );
};

export default CalendarCarousel;
