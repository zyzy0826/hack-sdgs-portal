import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Student from './pages/Student'
import Leader from './pages/Leader'
import GameMaster from './pages/GameMaster'
import AdminGroups from './pages/AdminGroups'
import StaffDashboard from './pages/StaffDashboard'
import Ranking from './pages/Ranking'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/student/:teamId" element={<Student />} />
      <Route path="/leader/:teamId" element={<Leader />} />
      <Route path="/gamemaster/:groupId" element={<GameMaster />} />
      <Route path="/admin/groups" element={<AdminGroups />} />
      <Route path="/staff" element={<StaffDashboard />} />
      <Route path="/staff/ranking" element={<Ranking />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
