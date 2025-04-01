import * as React from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/lib/hooks/useToast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props}
            // Add accessibility attributes
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            // Add data attributes for styling
            data-state={props.open ? 'open' : 'closed'}
            data-swipe-direction={props.swipeDirection}
            // Add test id for e2e testing
            data-testid="toast"
          >
            <div className="grid gap-1">
              {title && (
                <ToastTitle className="text-sm font-semibold">
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className="text-sm opacity-90">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose 
              aria-label="Fermer la notification"
              className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </Toast>
        );
      })}
      <ToastViewport 
        // Improve positioning and responsiveness
        className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 outline-none sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
        // Add accessibility attributes
        role="region"
        aria-label="Notifications"
        // Add test id for e2e testing
        data-testid="toast-viewport"
      />
    </ToastProvider>
  );
}