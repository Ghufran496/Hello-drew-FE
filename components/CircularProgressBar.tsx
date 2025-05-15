"use client";

import React from "react";

interface CircularProgressBarProps {
  percentage: number;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  percentage,
}) => {
  const radius = 50;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center flex-col w-[150px] h-[150px]">
      <svg height="150" width="150">
        <circle
          stroke="#e0e0e0"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx="75"
          cy="75"
        />
        <circle
          stroke="#007bff"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx="75"
          cy="75"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "75px 75px",
            transition: "stroke-dashoffset 0.3s ease-in-out",
          }}
        />
        <text
          x="75"
          y="75"
          dominantBaseline="middle"
          textAnchor="middle"
          className="text-lg font-bold"
        >
          {`${percentage}%`}
        </text>
      </svg>
      <div className="bg-[rgb(252 252 253 / var(--tw-bg-opacity, 1))] text-[#667287] text-sm">
        Complete
      </div>
    </div>
  );
};

export default CircularProgressBar;
