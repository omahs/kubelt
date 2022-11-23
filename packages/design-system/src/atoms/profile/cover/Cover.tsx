import React, { HTMLAttributes } from 'react'

import classNames from 'classnames'

export type CoverProps = HTMLAttributes<HTMLDivElement> & {
  src: string | undefined
}

export const Cover = ({ src, className, children, ...rest }: CoverProps) => {
  return (
    <div
      className={classNames(
        'h-[300px] w-full relative rounded-b-xl',
        className
      )}
      style={{
        backgroundImage: src ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
