import React from "react";
import { cn } from "./utils";

export default function Card({ as: Component = "section", className = "", children, ...props }) {
  return (
    <Component
      className={cn(
        "rounded-lg border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/60 backdrop-blur transition duration-200",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
