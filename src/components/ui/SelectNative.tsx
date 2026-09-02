// Tremor SelectNative [v1.0.0]
import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

import { cx, focusInput, hasErrorInput } from '../../lib/utils'

const selectNativeStyles = tv({
  base: [
    // base
    'peer w-full cursor-pointer appearance-none truncate rounded-md border py-2 pl-3 pr-7 shadow-xs outline-hidden transition-all sm:text-sm',
    // background color
    'bg-gray-950',
    // border color
    'border-gray-800',
    // text color
    'text-gray-50',
    // placeholder color
    'placeholder-gray-500',
    // hover
    'hover:bg-gray-900',
    // disabled
    'disabled:pointer-events-none',
    'disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-500',
    // focus
    focusInput,
  ],
  variants: {
    hasError: {
      true: hasErrorInput,
    },
  },
})

interface SelectNativeProps
  extends React.InputHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectNativeStyles> {}

const SelectNative = React.forwardRef<HTMLSelectElement, SelectNativeProps>(
  ({ className, hasError, ...props }: SelectNativeProps, forwardedRef) => {
    return (
      <select
        ref={forwardedRef}
        className={cx(selectNativeStyles({ hasError }), className)}
        tremor-id="tremor-raw"
        {...props}
      />
    )
  },
)

SelectNative.displayName = 'SelectNative'

export { SelectNative, type SelectNativeProps }
