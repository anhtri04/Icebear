import { AppShell } from './components/AppShell'
import { useAppController } from './app/useAppController'

export { validateConnectionTestInput } from './features/connections/connectionValidation'

export function App() {
  const appController = useAppController()

  return <AppShell {...appController} />
}
