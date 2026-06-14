import { Route, Routes } from 'react-router-dom'

import Ports from './views/Ports'
import Settings from './views/Settings'

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Ports />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default App
