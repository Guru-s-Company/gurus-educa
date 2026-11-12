export function SidebarMobileToggle({ mobileOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={mobileOpen}
      aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
      aria-controls="sidebar"
    >
      {mobileOpen ? "✕" : "☰"}
    </button>
  );
}