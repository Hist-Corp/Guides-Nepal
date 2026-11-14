import React, { useId } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className,
  labelClassName,
  wrapperClassName,
  disabled,
  id,
  checked,
  defaultChecked,
  onChange,
  required,
  ...rest
}) => {
  const generatedId = useId();
  const checkboxId = id || `gn-checkbox-${generatedId}`;

  return (
    <label
      className={`inline-flex items-center gap-2 cursor-pointer select-none ${wrapperClassName ?? ''}`}
    >
      <span className="relative flex items-center justify-center shrink-0">
        <input
          id={checkboxId}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          disabled={disabled}
          required={required}
          {...rest}
        />
        <span
          className={`transition-all duration-200 ease-in-out rounded-sm border border-gray-300 bg-gray-50 w-5 h-5 peer-focus:ring-2 peer-focus:ring-[#213448] peer-focus:ring-offset-2 peer-checked:bg-[#213448] peer-checked:border-[#213448] peer-disabled:bg-gray-100 peer-disabled:border-gray-200 peer-disabled:cursor-not-allowed ${className ?? ''}`}
        >
          {checked ? (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : null}
        </span>
      </span>
      {label && (
        <span className={`text-sm text-gray-700 ${labelClassName ?? ''}`}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
