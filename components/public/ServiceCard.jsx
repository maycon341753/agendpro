import React from "react";
import { Scissors, Sparkles, Clock } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatCurrencyBRL } from "@/utils/format";
import { cn } from "@/utils/cn";

const CATEGORY_ICONS = {
  Cabelo: Scissors,
  Unhas: Sparkles,
  Estética: Sparkles,
};

function ServiceCard({ service, selected, onSelect }) {
  const Icon = CATEGORY_ICONS[service.category] || Sparkles;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 overflow-hidden hover:shadow-md",
        selected
          ? "ring-2 ring-offset-2 shadow-md"
          : ""
      )}
      style={
        selected
          ? {
              "--tw-ring-color": service.color || "#ec4899",
            }
          : {}
      }
      onClick={() => onSelect?.(service)}
    >
      <div
        className="h-28 flex items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${service.color || "#ec4899"}cc 0%, ${service.color || "#ec4899"}66 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <Icon className="h-12 w-12 text-white relative z-10 drop-shadow-md" />
        {service.category && (
          <Badge
            className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-slate-700 border-0"
            variant="default"
          >
            {service.category}
          </Badge>
        )}
      </div>
      <CardBody className="space-y-3">
        <div>
          <h3 className="font-semibold text-slate-900 leading-tight">
            {service.name}
          </h3>
          {service.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
              {service.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{service.duration} min</span>
          </div>
          <span
            className="text-base font-bold"
            style={{ color: service.color || "#ec4899" }}
          >
            {formatCurrencyBRL(service.price)}
          </span>
        </div>
        <Button
          className="w-full"
          size="sm"
          variant={selected ? "primary" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(service);
          }}
        >
          {selected ? "Selecionado" : "Selecionar"}
        </Button>
      </CardBody>
    </Card>
  );
}

export default ServiceCard;
