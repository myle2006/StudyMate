import React from "react";
import { Link } from "react-router-dom";
import { cn } from "./utils";

const variants = {
  primary: "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/25 focus:ring-blue-200 active:translate-y-0",
  secondary: "border border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-200/50 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus:ring-blue-100 active:translate-y-0",
  subtle: "bg-slate-100 text-slate-700 hover:-translate-y-0.5 hover:bg-slate-200 focus:ring-slate-200 active:translate-y-0",
  danger: "border border-rose-200 bg-white text-rose-700 shadow-sm shadow-rose-100/60 hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-md focus:ring-rose-100 active:translate-y-0",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:ring-slate-200",
};

const sizes = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

export default function Button({
  as: Component = "button",
  to,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const { disabled, onClick, ...restProps } = props;
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-extrabold transition duration-200 outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
    disabled ? "pointer-events-none cursor-not-allowed opacity-60" : "",
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    className
  );

  if (to) {
    return (
      <Link
        {...restProps}
        to={disabled ? "#" : to}
        className={classes}
        aria-disabled={disabled ? "true" : undefined}
        tabIndex={disabled ? -1 : restProps.tabIndex}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
      >
        {children}
      </Link>
    );
  }

  return (
    <Component className={classes} disabled={disabled} onClick={onClick} {...restProps}>
      {children}
    </Component>
  );
}
