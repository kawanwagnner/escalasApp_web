import React from "react";
import { Link } from "react-router-dom";

interface AuthDividerProps {
  text?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({ text = "ou" }) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white text-gray-500">{text}</span>
      </div>
    </div>
  );
};

interface AuthLinkProps {
  text: string;
  linkText: string;
  to: string;
}

export const AuthLink: React.FC<AuthLinkProps> = ({ text, linkText, to }) => {
  return (
    <p className="text-center text-sm text-gray-600">
      {text}{" "}
      <Link
        to={to}
        className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
      >
        {linkText}
      </Link>
    </p>
  );
};

export const AuthFooter: React.FC<{ text?: string }> = ({
  text = "Ao continuar, você concorda com nossos termos de uso e política de privacidade.",
}) => {
  return <p className="text-center text-xs text-gray-500 mt-4">{text}</p>;
};
