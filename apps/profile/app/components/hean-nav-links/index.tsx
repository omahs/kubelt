import { useSubmit } from '@remix-run/react'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

export function SignOutLink({ className }: { className: string }) {
  let submit = useSubmit()

  return (
    <button
      className={`${className} w-full text-left`}
      style={{ cursor: 'pointer' }}
      onClick={() => submit(null, { method: 'post', action: `/signout/` })}
    >
      <Text className="truncate text-gray-800" size="sm" weight="medium">
        Sign Out
      </Text>
    </button>
  )
}

export function ConsoleLink({
  className,
  consoleURL,
}: {
  className: string
  consoleURL: string
}) {
  return (
    <a
      className={`${className}  w-full text-left`}
      style={{ cursor: 'pointer' }}
      href={consoleURL}
    >
      <Text className="truncate text-gray-800" size="sm" weight="medium">
        Console
      </Text>
    </a>
  )
}
