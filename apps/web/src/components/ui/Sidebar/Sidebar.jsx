import { useState } from "react";
import "./Sidebar.css";

const ITEMS = [
  { id: 1, icon: "T1", label: "Teste 1" },
  { id: 2, icon: "T2", label: "Teste 2" },
  { id: 3, icon: "T3", label: "Teste 3" },
  { id: 4, icon: "T4", label: "Teste 4" },
];

// iconSize e shadowSize (opcionais): ex. "2rem", "40px", "4px".
// Largura recolhida = iconSize + 2 * padding + shadowSize.
// Largura expandida = expandedWidth + shadowSize.
export default function Sidebar({ iconSize, shadowSize }) {
  const [expanded, setExpanded] = useState(false);

  const style = {};
  if (iconSize) style["--icon-size"] = iconSize;
  if (shadowSize) style["--shadow-size"] = shadowSize;

  return (
    <aside
      className={`sidebar ${expanded ? "expanded" : "collapsed"}`}
      style={style}
    >
      <header className="sidebar-header">
        <span className="sidebar-icon">H</span>
        <span className="sidebar-label">Header</span>
      </header>

      <nav className="sidebar-main">
        {/* O hover fica no <ul> para cobrir também o espaço entre os itens */}
        <ul
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        >
          {ITEMS.map((item) => (
            <li key={item.id} className="sidebar-item">
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-logo">
        <span className="sidebar-icon">L</span>
        <span className="sidebar-label">Logo</span>
      </div>
    </aside>
  );
}