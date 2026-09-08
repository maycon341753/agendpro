import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { DAYS_OF_WEEK } from "@/utils/constants";

function PublicCalendar({
  selectedDate,
  onDateSelect,
  disabledDates = [],
  brandColor = "#ec4899",
}) {
  const [viewMonth, setViewMonth] = React.useState(() => {
    const base = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDisabled = (date) => {
    if (date < today) return true;
    return disabledDates.some((d) => {
      const disabled = new Date(d);
      disabled.setHours(0, 0, 0, 0);
      return (
        date.getDate() === disabled.getDate() &&
        date.getMonth() === disabled.getMonth() &&
        date.getFullYear() === disabled.getFullYear()
      );
    });
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    const sel = new Date(selectedDate);
    sel.setHours(0, 0, 0, 0);
    return (
      date.getDate() === sel.getDate() &&
      date.getMonth() === sel.getMonth() &&
      date.getFullYear() === sel.getFullYear()
    );
  };

  const isToday = (date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const goToPrevMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  };

  const monthDays = React.useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days = [];

    for (let i = startWeekDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    while (days.length % 7 !== 0) {
      const lastDate = days[days.length - 1].date;
      const next = new Date(lastDate);
      next.setDate(next.getDate() + 1);
      days.push({ date: next, isCurrentMonth: false });
    }

    return days;
  }, [viewMonth]);

  const monthName = viewMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronLeft className="h-4 w-4" />}
          onClick={goToPrevMonth}
          aria-label="Mês anterior"
        />
        <h3 className="font-semibold text-slate-900 capitalize">
          {monthName}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronRight className="h-4 w-4" />}
          onClick={goToNextMonth}
          aria-label="Próximo mês"
        />
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day.value}
            className="text-center text-xs font-medium text-slate-500 py-2"
          >
            {day.shortLabel}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthDays.map(({ date, isCurrentMonth }, idx) => {
          const disabled = !isCurrentMonth || isDisabled(date);
          const selected = isSelected(date);
          const todayFlag = isToday(date);

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onDateSelect?.(date)}
              className={cn(
                "aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
                disabled && !isCurrentMonth
                  ? "text-slate-300 cursor-default"
                  : disabled
                    ? "text-slate-400 bg-slate-50 cursor-not-allowed line-through"
                    : selected
                      ? "text-white shadow-md scale-105"
                      : todayFlag
                        ? "ring-2 ring-offset-1 text-slate-900 hover:bg-slate-50"
                        : "text-slate-700 hover:bg-slate-100 active:scale-95"
              )}
              style={
                selected
                  ? { backgroundColor: brandColor }
                  : todayFlag
                    ? { "--tw-ring-color": brandColor }
                    : {}
              }
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PublicCalendar;
