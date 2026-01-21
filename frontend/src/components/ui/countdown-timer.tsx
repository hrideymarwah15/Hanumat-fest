"use client";

import { useEffect, useState } from "react";
import { cn, getCountdown } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: string | Date;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "minimal";
  onExpire?: () => void;
}

export function CountdownTimer({
  targetDate,
  label = "Time Remaining",
  className,
  size = "md",
  variant = "default",
  onExpire,
}: CountdownTimerProps) {
  const [countdown, setCountdown] = useState(getCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdown = getCountdown(targetDate);
      setCountdown(newCountdown);
      if (newCountdown.expired && onExpire) {
        onExpire();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (countdown.expired) {
    return (
      <div className={cn("text-center", className)}>
        <p className="text-destructive font-medium">Deadline Passed</p>
      </div>
    );
  }

  const sizeClasses = {
    sm: {
      container: "gap-2",
      box: "w-12 h-12",
      number: "text-lg",
      label: "text-[10px]",
    },
    md: {
      container: "gap-3",
      box: "w-16 h-16",
      number: "text-2xl",
      label: "text-xs",
    },
    lg: {
      container: "gap-4",
      box: "w-20 h-20",
      number: "text-3xl",
      label: "text-sm",
    },
  };

  const sizes = sizeClasses[size];

  const units = [
    { value: countdown.days, label: "Days" },
    { value: countdown.hours, label: "Hours" },
    { value: countdown.minutes, label: "Mins" },
    { value: countdown.seconds, label: "Secs" },
  ];

  if (variant === "card") {
    return (
      <div className={cn("text-center", className)}>
        {label && (
          <p className="text-sm text-muted-foreground mb-3">{label}</p>
        )}
        <div className={cn("flex justify-center", sizes.container)}>
          {units.map((unit) => (
            <div
              key={unit.label}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20",
                sizes.box
              )}
            >
              <span
                className={cn(
                  "font-bold text-primary font-mono",
                  sizes.number
                )}
              >
                {String(unit.value).padStart(2, "0")}
              </span>
              <span className={cn("text-muted-foreground", sizes.label)}>
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {units.map((unit, index) => (
          <div key={unit.label} className="flex items-center">
            <span className="font-mono font-bold text-primary">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground ml-0.5">
              {unit.label.charAt(0).toLowerCase()}
            </span>
            {index < units.length - 1 && (
              <span className="mx-1 text-muted-foreground">:</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1 text-sm", className)}>
      {label && <span className="text-muted-foreground">{label}: </span>}
      <span className="font-mono font-medium">
        {countdown.days > 0 && `${countdown.days}d `}
        {String(countdown.hours).padStart(2, "0")}:
        {String(countdown.minutes).padStart(2, "0")}:
        {String(countdown.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
