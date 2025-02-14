/**
 * @file app/shared/components/SiteMenu/appSelect.tsx
 *
 * Derived from TailwindUI > Select Menus > Custom with avatar.
 */

import { useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { HiGlobeAlt } from 'react-icons/hi'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { NewAppModal } from '../NewAppModal/NewAppModal'

// Utility
// -----------------------------------------------------------------------------

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

// Given an array of application objects and an application ID, return
// the array index of the application with the given unique identifier.
// Note that Array.findIndex() returns -1 if no matching array entry was found.
function indexFor(
  apps: {
    clientId: string
  }[],
  appId: string
): number {
  return apps.findIndex((app) => app.clientId === appId)
}

// AppListbox
// -----------------------------------------------------------------------------

type AppListboxProps = {
  // The list of apps to display in the dropdown.
  // TODO tighten up this definition
  apps: {
    clientId: string
    name: string
    icon: string
  }[]
  //
  selectedAppIndex: number
}

function AppListbox({ apps, selectedAppIndex }: AppListboxProps) {
  const [newAppModalOpen, setNewAppModalOpen] = useState(false)

  const [selected] = useState(
    apps.length !== 0
      ? selectedAppIndex < 0
        ? {
            clientId: 'none',
            name: 'All Applications',
            icon: undefined,
          }
        : apps[selectedAppIndex]
      : {
          clientId: 'none',
          name: 'No Applications',
          icon: undefined,
        }
  )

  const setSelected = (selected: { clientId: string }) => {
    // Using useNavigation hook
    // doesn't refresh the
    // details component
    if (window)
      if (selected.clientId === 'all') {
        window.location.href = `/`
      } else if (selected.clientId !== 'none') {
        window.location.href = `/apps/${selected.clientId}`
      }
  }

  return (
    <>
      <NewAppModal
        isOpen={newAppModalOpen}
        newAppCreateCallback={() => {
          setNewAppModalOpen(false)
        }}
      />
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <>
            <div className="relative mt-1">
              <Listbox.Button className="relative w-full cursor-default border border-l-0 border-r-0 border-gray-700 bg-transparent text-white py-5 pl-4 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm">
                <span className="flex items-center">
                  {/* <img src={selected.icon} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" /> */}
                  {selected.clientId === 'none' && (
                    <HiGlobeAlt
                      className={`h-6 w-6 ${
                        apps.length === 0 ? 'text-gray-600' : 'text-gray-300'
                      } mr-2.5`}
                    />
                  )}

                  {selected.clientId !== 'none' && (
                    <div className="rounded-full w-6 h-6 flex justify-center items-center bg-gray-200 overflow-hidden mr-2.5">
                      {!selected.icon && (
                        <Text className="text-gray-500">
                          {selected.name?.substring(0, 1)}
                        </Text>
                      )}
                      {selected.icon && (
                        <img src={selected.icon} className="object-cover" />
                      )}
                    </div>
                  )}

                  <Text
                    weight="medium"
                    className={`${
                      apps.length === 0 ? 'text-gray-600' : 'text-white'
                    }`}
                  >
                    {selected.name}
                  </Text>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open && (apps.length > 0 || selected.clientId !== 'none')}
                as="div"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="bg-gray-800"
              >
                <Listbox.Options className="w-full text-gray-300">
                  <Listbox.Option
                    className="flex items-center px-4 py-4 border border-l-0 border-r-0 border-t-0 border-gray-700 cursor-pointer hover:bg-gray-700"
                    value={{
                      clientId: 'all',
                    }}
                  >
                    <HiGlobeAlt className={`h-6 w-6 mr-2.5`} />

                    <Text size="sm" weight="medium">
                      All Applications
                    </Text>
                  </Listbox.Option>

                  {apps.map((app) => (
                    <Listbox.Option key={app.clientId} value={app}>
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center py-2 px-4 cursor-pointer hover:bg-gray-700">
                            <div className="rounded-full w-6 h-6 flex justify-center items-center bg-gray-200 overflow-hidden mr-2.5">
                              {!app.icon && (
                                <Text className="text-gray-500">
                                  {app.name?.substring(0, 1)}
                                </Text>
                              )}
                              {app.icon && (
                                <img src={app.icon} className="object-cover" />
                              )}
                            </div>

                            <Text size="sm" weight="medium">
                              {app.name}
                            </Text>
                          </div>
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>

                <div className="w-full justify-center border border-l-0 border-r-0 border-gray-700 px-4 py-3">
                  <Button
                    className="w-full"
                    btnType="primary-alt"
                    onClick={() => setNewAppModalOpen(true)}
                  >
                    Create Application
                  </Button>
                </div>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </>
  )
}

// Component
// -----------------------------------------------------------------------------

type AppSelectProps = {
  // The list of apps to display in the dropdown.
  // TODO tighten up this definition
  apps: {
    clientId: string
    name: string
    icon: string
  }[]
  // The currently selected application ID.
  selected?: string
}

export default function AppSelect(props: AppSelectProps) {
  // Get the array index of the application with the given id.
  const appIndex = props.selected ? indexFor(props.apps, props.selected) : -1

  return <AppListbox apps={props.apps} selectedAppIndex={appIndex} />
}
