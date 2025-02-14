import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { useState } from 'react'
import { DeleteAppModal } from '../DeleteAppModal/DeleteAppModal'

import {
  ApplicationListItem,
  ApplicationListItemProps,
  ApplicationListItemPublishedState,
} from './ApplicationListItem'

type ApplicationListProps = {
  applications: ApplicationListItemProps[]
  onCreateApplication?: () => void
}

export const ApplicationList = ({
  applications,
  onCreateApplication,
}: ApplicationListProps) => {
  const handleCreateApplication = () => {
    if (onCreateApplication) {
      onCreateApplication()
    }
  }

  const [actionApp, setActionApp] = useState<
    | {
        clientId: string
        name: string
      }
    | undefined
  >()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  return (
    <div>
      <section className="flex justify-between items-start">
        <Text size="base" weight="semibold" className="text-gray-900">
          Your Applications
        </Text>

        <Button btnType="primary-alt" onClick={handleCreateApplication}>
          Create Application
        </Button>
      </section>

      <section className="flex space-x-4 my-4">
        <div className="flex space-x-2 items-center">
          <ApplicationListItemPublishedState published={true} />
          <Text size="xs" weight="normal" className="text-gray-500">
            Published
          </Text>
        </div>

        <div className="flex space-x-2 items-center">
          <ApplicationListItemPublishedState published={false} />
          <Text size="xs" weight="normal" className="text-gray-500">
            Unpublished
          </Text>
        </div>
      </section>

      <section className="flex flex-col space-y-2">
        {actionApp && (
          <DeleteAppModal
            isOpen={deleteModalOpen}
            deleteAppCallback={() => {
              setDeleteModalOpen(false)
            }}
            clientId={actionApp?.clientId}
            appName={actionApp?.name}
          />
        )}

        {applications.map((ali) => (
          <ApplicationListItem
            key={ali.id}
            {...ali}
            onDeleteApplication={(clientId, appName) => {
              setActionApp({
                clientId,
                name: appName,
              })
              setDeleteModalOpen(true)
            }}
          />
        ))}
      </section>
    </div>
  )
}
