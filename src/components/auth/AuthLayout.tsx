import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  gradient?: "blue" | "purple" | "green";
}

const gradientClasses = {
  blue: "from-blue-50 via-white to-purple-50",
  purple: "from-purple-50 via-white to-blue-50",
  green: "from-green-50 via-white to-blue-50",
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  gradient = "blue",
}) => {
  return (
    <div
      className={`min-h-screen bg-linear-to-br ${gradientClasses[gradient]} flex items-center justify-center px-4 py-8`}
    >
      <div className="max-w-md w-full">{children}</div>
    </div>
  );
};
