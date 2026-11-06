import { useState } from "react";
import "./Sidebar.css";

import {
  AwardIcon,
  BookOpenIcon,
  HomeIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  LogoIcon,
} from "../Icon/Icon";

const ITEMS = [
  { id: 1, icon: <HomeIcon />, label: "Início" },
  { id: 2, icon: <BookOpenIcon />, label: "Meus cursos" },
  { id: 3, icon: <UsersIcon />, label: "Comunidades" },
  { id: 4, icon: <AwardIcon />, label: "Conquistas" },
];

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
        <span className="sidebar-logo" aria-hidden="true">
          <LogoIcon size={56} />
        </span>
        <h1 className="sidebar-title">Guru&apos;s Educa</h1>
      </header>

      <nav className="sidebar-main">
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

      <footer
        className="sidebar-footer"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <button className="sidebar-item sidebar-footer__item" type="button">
          <span className="sidebar-icon"><UserIcon /></span>
          <span className="sidebar-label">Minha conta</span>
        </button>
        <button className="sidebar-item sidebar-footer__item" type="button">
          <span className="sidebar-icon"><SettingsIcon /></span>
          <span className="sidebar-label">Ajustes</span>
        </button>
      </footer>
    </aside>
  );
}