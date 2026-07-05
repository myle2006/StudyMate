import React from "react";
import { cn } from "./utils";

export default function Card({ as: Component = "section", className = "", children, ...props }) {
  return (
    <Component
      className={cn("rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
