import React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/utils/cn";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

/**
 * DateRangePicker - Seletor simples de intervalo de datas com presets
 * @param {Object} props
 * @param {string} [props.startDate] - YYYY-MM-DD
 * @param {string} [props.endDate] - YYYY-MM-DD
 * @param {function({startDate: string, endDate: string}): void} [props.onChange]
 * @param {string} [props.className]
 */
function formatISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function DateRangePicker({ startDate, endDate, onChange, className }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const presets = React.useMemo(
    () => [
      {
        label: "Hoje",
        getValue: () => {
          const s = formatISO(today);
          return { startDate: s, endDate: s };
        },
      },
      {
        label: "Ontem",
        getValue: () => {
          const y = addDays(today, -1);
          const s = formatISO(y);
          return { startDate: s, endDate: s };
        },
      },
      {
        label: "Últimos 7 dias",
        getValue: () => ({
          startDate: formatISO(addDays(today, -6)),
          endDate: formatISO(today),
        }),
      },
      {
        label: "Últimos 30 dias",
        getValue: () => ({
          startDate: formatISO(addDays(today, -29)),
          endDate: formatISO(today),
        }),
      },
      {
        label: "Este mês",
        getValue: () => ({
          startDate: formatISO(startOfMonth(today)),
          endDate: formatISO(endOfMonth(today)),
        }),
      },
      {
        label: "Mês anterior",
        getValue: () => {
          const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          return {
            startDate: formatISO(startOfMonth(prev)),
            endDate: formatISO(endOfMonth(prev)),
          };
        },
      },
    ],
    [today.getTime()]
  );

  function handleChange(field, value) {
    onChange?.({
      startDate: field === "startDate" ? value : startDate || "",
      endDate: field === "endDate" ? value : endDate || "",
    });
  }

  function applyPreset(preset) {
    const val = preset.getValue();
    onChange?.(val);
  }

  function handleClear() {
    onChange?.({ startDate: "", endDate: "" });
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-white border border-slate-200 shadow-sm p-4 space-y-4",
        className
      )}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          type="date"
          label="Data início"
          value={startDate || ""}
          leftIcon={<Calendar className="h-4 w-4" />}
          onChange={(e) => handleChange("startDate", e.target.value)}
        />
        <Input
          type="date"
          label="Data fim"
          value={endDate || ""}
          leftIcon={<Calendar className="h-4 w-4" />}
          onChange={(e) => handleChange("endDate", e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Button
            key={p.label}
            variant="outline"
            size="sm"
            onClick={() => applyPreset(p)}
          >
            {p.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="ml-auto"
        >
          Limpar
        </Button>
      </div>
    </div>
  );
}

export default DateRangePicker;
