import type { AppState } from '../../appTypes'
import { objectListNodeId, objectNodeId } from '../../appTypes'
import { ConnectionDetail } from '../connections/ConnectionDetail'
import { BucketView } from '../object-browser/BucketView'
import { ObjectDetail } from '../object-browser/ObjectDetail'
import { WelcomeView } from './WelcomeView'

interface MainViewProps {
  readonly state: AppState
  readonly onOpenConnectionModal: () => void
  readonly onRefreshSelectedBuckets: () => void
  readonly onRefreshSelectedObjects: () => void
  readonly onRefreshSelectedObjectMetadata: () => void
  readonly onSelectBucket: (connectionId: string, bucket: string) => void
  readonly onSelectPrefix: (connectionId: string, bucket: string, prefix: string) => void
  readonly onSelectObject: (connectionId: string, bucket: string, key: string, prefix: string) => void
}

export function MainView({
  state,
  onOpenConnectionModal,
  onRefreshSelectedBuckets,
  onRefreshSelectedObjects,
  onRefreshSelectedObjectMetadata,
  onSelectBucket,
  onSelectPrefix,
  onSelectObject,
}: MainViewProps) {
  const { selection } = state

  if (selection.type === 'connection') {
    const connection = state.connections.find((item) => item.id === selection.connectionId)
    if (connection) {
      return <ConnectionDetail state={state} connectionId={connection.id} onRefreshSelectedBuckets={onRefreshSelectedBuckets} onSelectBucket={onSelectBucket} />
    }
  }

  if (selection.type === 'bucket') {
    const prefix = selection.prefix ?? ''
    const id = objectListNodeId(selection.connectionId, selection.bucket, prefix)
    return (
      <main className="min-h-0 overflow-auto bg-canvas p-6">
        <BucketView
          bucket={selection.bucket}
          prefix={prefix}
          result={state.objectsByBucketId[id]}
          isLoading={state.loadingObjectBucketIds.includes(id)}
          error={state.errorsByNodeId[id]}
          onRefreshObjects={onRefreshSelectedObjects}
          onOpenPrefix={(nextPrefix) => onSelectPrefix(selection.connectionId, selection.bucket, nextPrefix)}
          onSelectObject={(key) => onSelectObject(selection.connectionId, selection.bucket, key, prefix)}
        />
      </main>
    )
  }

  if (selection.type === 'object') {
    const id = objectNodeId(selection.connectionId, selection.bucket, selection.key)
    return (
      <main className="min-h-0 overflow-auto bg-canvas p-6">
        <ObjectDetail
          bucket={selection.bucket}
          objectKey={selection.key}
          prefix={selection.prefix ?? ''}
          metadata={state.objectMetadataById[id]}
          isLoading={state.loadingObjectMetadataIds.includes(id)}
          error={state.errorsByNodeId[id]}
          onBack={() => onSelectPrefix(selection.connectionId, selection.bucket, selection.prefix ?? '')}
          onRefreshMetadata={onRefreshSelectedObjectMetadata}
        />
      </main>
    )
  }

  return <WelcomeView onOpenConnectionModal={onOpenConnectionModal} />
}
