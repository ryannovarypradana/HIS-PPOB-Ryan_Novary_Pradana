
import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode; 
  isPasswordToggle?: boolean; 
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, id, type = 'text', placeholder, icon, isPasswordToggle, className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  
  const actualType = isPasswordToggle && showPassword ? 'text' : type;

  return (
    <div className="mb-4 text-left">
      {label && (
        <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
          {label}
        </label>
      )}
      <div className="relative"> {/* Tambahkan relative untuk penempatan ikon */}
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={actualType}
          id={id}
          placeholder={placeholder}
          className={`
            shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
            transition duration-200
            ${icon ? 'pl-9' : ''} 
            ${isPasswordToggle ? 'pr-9' : ''}
            h-10 
            ${className || ''}
          `}
          ref={ref}
          {...props}
        />
        {isPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.5-.241.875-.564 1.7-.93 2.5M9 10.5a3 3 0 1 1 6 0 3 3 0 0 1 -6 0Zm-4.243-2.432-1.768-1.768A10.474 10.474 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395m-4.243-2.432-1.768-1.768A10.474 10.474 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.175a1.012 1.012 0 0 1 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.175Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
