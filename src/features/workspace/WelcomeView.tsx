import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { Panel } from '../../components/Panel'
import { storageProviderLabels } from '../connections/connectionTypes'

interface WelcomeViewProps {
  readonly onOpenConnectionModal: () => void
}

export function WelcomeView({ onOpenConnectionModal }: WelcomeViewProps) {
  const providerBadges = [
    ...storageProviderLabels.map((label) => <Badge key={label}>{label}</Badge>),
    <Badge key="generic-s3">Generic S3</Badge>,
  ]

  return (
    <main className="min-h-0 overflow-auto bg-canvas p-6">
      <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
        <Panel className="w-full p-8">
          <EmptyState
            icon="⬣"
            eyebrow="Icebear workspace"
            title="Connect to Object Storage"
            description="Browse buckets, inspect objects, and prepare datasets from Amazon S3, Cloudflare R2, MinIO, and other S3-compatible providers."
          />
          <div className="mt-6 flex flex-wrap justify-center gap-2">{providerBadges}</div>
          <div className="mt-8 flex justify-center gap-3">
            <Button variant="primary" onClick={onOpenConnectionModal}>
              Add connection
            </Button>
            <Button>Learn workflow</Button>
          </div>
        </Panel>
      </div>
    </main>
  )
}
