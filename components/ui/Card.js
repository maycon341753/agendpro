import React from "react";
import { cn } from "@/utils/cn";

/**
 * Card - Container principal
 * @param {React.HTMLAttributes<HTMLDivElement>} props
 * @param {string} [props.className] - Classes adicionais para sobrescrita
 */
const Card = React.forwardRef(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl bg-white border border-slate-200 shadow-sm",
        className
      )}
      {...props}
    />
  );
});

/**
 * CardHeader - Cabeçalho do card (padding + borda inferior opcional
 * @param {string} [className]
 */
const CardHeader = React.forwardRef(function CardHeader(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("p-6 pb-0", className)}
      {...props}
    />
  );
});

/**
 * CardBody - Corpo do card
 * @param {string} [className]
 */
const CardBody = React.forwardRef(function CardBody(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cn("p-6", className)} {...props} />;
});

/**
 * CardFooter - Rodapé do card
 * @param {string} [className]
 */
const CardFooter = React.forwardRef(function CardFooter(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("p-6 pt-0 flex items-center", className)}
      {...props}
    />
  );
});

/**
 * CardTitle - Título do card
 * @param {string} [className]
 */
const CardTitle = React.forwardRef(function CardTitle(
  { className, ...props },
  ref
) {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-slate-900",
        className
      )}
      {...props}
    />
  );
});

/**
 * CardDescription - Descrição do card
 * @param {string} [className]
 */
const CardDescription = React.forwardRef(function CardDescription(
  { className, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-slate-500 mt-1.5", className)}
      {...props}
    />
  );
});

export { Card, CardHeader, CardBody, CardFooter, CardTitle, CardDescription };
export default Card;
