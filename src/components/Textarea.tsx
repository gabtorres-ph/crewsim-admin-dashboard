import React from "react";

import { cx, focusInput, hasErrorInput } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError = false, ...props }, forwardedRef) => (
    <textarea
      ref={forwardedRef}
      className={cx(
        "block min-h-24 w-full resize-y rounded-md border border-gray-300 bg-white px-2.5 py-2 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 dark:placeholder:text-gray-500 dark:disabled:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-500",
        focusInput,
        hasError && hasErrorInput,
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

export { Textarea, type TextareaProps };
