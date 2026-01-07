import React, { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className = "",
  hover = false,
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ${
        hover ? "hover:shadow-xl hover:scale-105" : ""
      } ${className}`}
    >
      {title && (
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
};
