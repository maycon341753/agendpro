import React from "react";
import { cn } from "@/utils/cn";

function TimeSlot({ time, available, selected, onSelect, brandColor = "#ec4899" }) {
  return (
    <button
      type="button"
      disabled={!available}
      onClick={() => available && onSelect?.(time)}
      className={cn(
        "h-11 px-2 rounded-lg text-sm font-medium transition-all duration-200 border",
        !available
          ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through"
          : selected
            ? "text-white border-transparent shadow-md scale-105"
            : "bg-white border-slate-300 text-slate-700 hover:border-brand-500 hover:shadow-sm active:scale-95"
      )}
      style={
        selected
          ? { backgroundColor: brandColor }
          : !available
            ? {}
            : {
                "--tw-text-opacity": 1,
              }
      }
    >
      {available ? time : "Indisponível"}
    </button>
  );
}

export default TimeSlot;
