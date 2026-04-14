import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Sidebar } from '../components/layout/Sidebar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function closeSidebar() { setSidebarOpen(false) }
  function toggleSidebar() { setSidebarOpen((prev) => !prev) }

  return (
    <div className="app-shell">
      {/* Backdrop — só aparece no mobile/tablet quando sidebar está aberta */}
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' sidebar-backdrop-open' : ''}`}
        onClick={closeSidebar}
      />

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="app-content">
        <Header onMenuToggle={toggleSidebar} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
