import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  action,
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700/50 flex justify-between items-center">
          {title && (
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
