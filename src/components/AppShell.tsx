import type { SaveObjectStorageConnectionInput } from '../../shared/credentialTypes'
import type { AppState } from '../appTypes'
import { ConnectionFormModal } from '../features/connections/ConnectionFormModal'
import { ConnectionsSidebar } from '../features/connections/ConnectionsSidebar'
import { MainView } from '../features/workspace/MainView'
import { AppHeader } from './AppHeader'

interface AppShellProps {
  readonly state: AppState
  readonly onOpenConnectionModal: () => void
  readonly onCloseConnectionModal: () => void
  readonly onRefreshConnections: () => void
  readonly onDeleteSelectedConnection: () => void
  readonly onRefreshSelectedBuckets: () => void
  readonly onRefreshSelectedObjects: () => void
  readonly onRefreshSelectedObjectMetadata: () => void
  readonly onSelectConnection: (connectionId: string) => void
  readonly onSelectBucket: (connectionId: string, bucket: string) => void
  readonly onSelectPrefix: (connectionId: string, bucket: string, prefix: string) => void
  readonly onSelectObject: (connectionId: string, bucket: string, key: string, prefix: string) => void
  readonly onSaveConnection: (input: SaveObjectStorageConnectionInput) => void
  readonly onTestConnection: (input: SaveObjectStorageConnectionInput) => void
}

export function AppShell(props: AppShellProps) {
  const { state } = props

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="grid min-h-screen grid-rows-[var(--layout-header-height)_minmax(0,1fr)]">
        <AppHeader state={state} />

        <div className="grid min-h-0 grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)_320px] max-xl:grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)_0px]">
          <ConnectionsSidebar
            state={state}
            onOpenConnectionModal={props.onOpenConnectionModal}
            onRefreshConnections={props.onRefreshConnections}
            onDeleteSelectedConnection={props.onDeleteSelectedConnection}
            onSelectConnection={props.onSelectConnection}
            onSelectBucket={props.onSelectBucket}
          />
          <MainView
            state={state}
            onOpenConnectionModal={props.onOpenConnectionModal}
            onRefreshSelectedBuckets={props.onRefreshSelectedBuckets}
            onRefreshSelectedObjects={props.onRefreshSelectedObjects}
            onRefreshSelectedObjectMetadata={props.onRefreshSelectedObjectMetadata}
            onSelectBucket={props.onSelectBucket}
            onSelectPrefix={props.onSelectPrefix}
            onSelectObject={props.onSelectObject}
          />
          <aside className="min-h-0 border-l border-border bg-surface max-xl:hidden" aria-label="Options" />
        </div>
      </div>
      {state.isConnectionModalOpen ? (
        <ConnectionFormModal
          statusMessage={state.statusMessage}
          onClose={props.onCloseConnectionModal}
          onSave={props.onSaveConnection}
          onTest={props.onTestConnection}
        />
      ) : null}
    </div>
  )
}
