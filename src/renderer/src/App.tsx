import { Route, Routes } from 'react-router-dom'

import PortsView from './features/ports/View'
import SettingsView from './features/settings/View'

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<PortsView />} />
      <Route path="/settings" element={<SettingsView />} />
    </Routes>
  )
}

export default App
