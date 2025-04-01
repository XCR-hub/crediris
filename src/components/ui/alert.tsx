import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, XCircle, LucideIcon } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>div]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-600",
        warning:
          "border-yellow-500/50 text-yellow-700 dark:border-yellow-500 [&>svg]:text-yellow-600",
        info:
          "border-blue-500/50 text-blue-700 dark:border-blue-500 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  title?: string;
  description?: string;
  icon?: LucideIcon;
}

function AlertWithIcon({ variant, title, description, icon: CustomIcon, className, ...props }: AlertProps) {
  const icons = {
    default: Info,
    destructive: XCircle,
    success: CheckCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = CustomIcon || icons[variant || "default"];

  return (
    <Alert variant={variant} className={cn("flex items-start gap-4", className)} {...props}>
      <Icon className="h-5 w-5 shrink-0" />
      <div>
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
    </Alert>
  );
}

export { Alert, AlertTitle, AlertDescription, AlertWithIcon };