import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, className = '', ...props }, ref) => {
  return (
    <button
      className={`w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-200 disabled:bg-red-300 disabled:cursor-not-allowed ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button'; 

export default Button;
