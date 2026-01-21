import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Clock,
  CreditCard,
  CheckCircle,
  Hourglass,
  XCircle,
  MinusCircle,
} from "lucide-react";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white",
        secondary:
          "border-transparent bg-secondary text-primary",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline:
          "text-foreground border-border",
        // Common utility variants
        success:
          "border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        warning:
          "border-transparent bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        info:
          "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        // Status variants
        pending:
          "border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        payment_pending:
          "border-transparent bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        confirmed:
          "border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        waitlist:
          "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        cancelled:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        withdrawn:
          "border-transparent bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        // Category variants
        indoor:
          "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        outdoor:
          "border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        esports:
          "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        athletics:
          "border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  showIcon?: boolean;
}

const statusIcons = {
  pending: Clock,
  payment_pending: CreditCard,
  confirmed: CheckCircle,
  waitlist: Hourglass,
  cancelled: XCircle,
  withdrawn: MinusCircle,
};

function Badge({ className, variant, showIcon = false, children, ...props }: BadgeProps) {
  const Icon = variant && statusIcons[variant as keyof typeof statusIcons];
  
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {showIcon && Icon && <Icon className="h-3 w-3" />}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
