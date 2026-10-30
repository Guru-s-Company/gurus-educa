import './App.css'
import { useState } from 'react'
import ActionButton from './components/ui/Button/ActionButton'
import CommunityCard from './components/ui/Card/CommunityCard'
import RegisterForm from './components/ui/Form/RegisterForm'
import SelectField from './components/ui/Field/SelectField'
import Sidebar, { SidebarMobileToggle } from './components/ui/Sidebar/Sidebar'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)

  return (
    <>
      <header style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <SidebarMobileToggle
          mobileOpen={sidebarMobileOpen}
          onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}
        />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Guru's Educa</h1>
      </header>

      <main style={{ marginLeft: sidebarCollapsed ? '72px' : '260px', padding: '2rem', transition: 'margin-left 200ms ease' }}>
        <SelectField
          label="Curso"
          name="curso"
          options={[
            { value: "dev", label: "Desenvolvimento" },
            { value: "design", label: "Design" },
            { value: "dados", label: "Dados" },
          ]}
          onChange={(value) => console.log(value)}
        />

        <br />

        <ActionButton className="fill">
          Click me
        </ActionButton>

        <br />

        <ActionButton className="outline">
          Click me
        </ActionButton>

        <br />
        <br />

        <CommunityCard
          title="My Community"
          description="lorem  ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor. asfasfasfafafafasfafaffsasadscsfdf"
          icon="/path/to/icon.svg"
          imageUrl="/path/to/image.jpg"
        />

        <br />

        <RegisterForm />

        <br />
      </main>

      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapseChange={setSidebarCollapsed}
        mobileOpen={sidebarMobileOpen}
        onMobileOpenChange={setSidebarMobileOpen}
        user={{ name: 'João Silva', email: 'joao@guru.com' }}
        onLogout={() => console.log('logout')}
      />
    </>
  )
}

export default App