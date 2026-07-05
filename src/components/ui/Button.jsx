import React from "react";
import { Link } from "react-router-dom";
import { cn } from "./utils";

const variants = {
  primary: "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 focus:ring-blue-200",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:ring-blue-100",
  subtle: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-200",
  danger: "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 focus:ring-rose-100",
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
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-extrabold transition outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    className
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
