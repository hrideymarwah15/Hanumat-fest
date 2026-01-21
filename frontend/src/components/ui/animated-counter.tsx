"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 2000,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function (ease-out-expo)
      const easeOutExpo =
        progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = startValue + (endValue - startValue) * easeOutExpo;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, duration]);

  const formattedValue =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.floor(displayValue).toLocaleString();

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

interface StatsCounterProps {
  stats: Array<{
    value: number;
    label: string;
    prefix?: string;
    suffix?: string;
  }>;
  className?: string;
}

export function StatsCounter({ stats, className }: StatsCounterProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8",
        className
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm"
        >
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">
            <AnimatedCounter
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
            />
          </div>
          <div className="text-sm text-white/80">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
