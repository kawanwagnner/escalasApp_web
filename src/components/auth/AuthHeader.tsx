import React from "react";
import { Calendar } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  iconColor?: "blue" | "purple" | "green";
}

const iconColorClasses = {
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  green: "bg-green-100 text-green-600",
};

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  iconColor = "blue",
}) => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className={`p-4 rounded-full ${iconColorClasses[iconColor]}`}>
          <Calendar className="h-12 w-12" />
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
        {title}
      </h1>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  );
};
