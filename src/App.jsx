import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProgrammaPage from './pages/ProgrammaPage'
import UitslagenPage from './pages/UitslagenPage'
import TeamsIndexPage from './pages/TeamsIndexPage'
import TeamPage from './pages/TeamPage'
import NieuwsPage from './pages/NieuwsPage'
import NieuwsDetailPage from './pages/NieuwsDetailPage'
import ActiviteitenPage from './pages/ActiviteitenPage'
import ActiviteitDetailPage from './pages/ActiviteitDetailPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="programma" element={<ProgrammaPage />} />
        <Route path="uitslagen" element={<UitslagenPage />} />
        <Route path="teams" element={<TeamsIndexPage />} />
        <Route path="teams/:slug" element={<TeamPage />} />
        <Route path="nieuws" element={<NieuwsPage />} />
        <Route path="nieuws/:slug" element={<NieuwsDetailPage />} />
        <Route path="activiteiten" element={<ActiviteitenPage />} />
        <Route path="activiteiten/:slug" element={<ActiviteitDetailPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
