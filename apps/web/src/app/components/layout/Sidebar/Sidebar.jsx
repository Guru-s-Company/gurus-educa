import { useCallback, useState } from "react";
import "./Sidebar.css";

import { NavLink } from "react-router-dom";
import {
  AwardIcon,
  BookOpenIcon,
  HomeIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  LogoIcon,
} from "../../ui/Icon/Icon";
import { useTheme } from "../../../providers/ThemeContext";
import ProfileModal from "../../../../features/profile/components/ProfileModal";

const ITEMS = [
  { path: "/", icon: <HomeIcon />, label: "Início" },
  { path: "/cursos", icon: <BookOpenIcon />, label: "Meus cursos" },
  { path: "/comunidades", icon: <UsersIcon />, label: "Comunidades" },
  { path: "/conquistas", icon: <AwardIcon />, label: "Conquistas" },
];

export default function Sidebar({ iconSize, shadowSize }) {
  const [expanded, setExpanded] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const closeProfile = useCallback(() => setIsProfileOpen(false), []);

  const style = {};
  if (iconSize) style["--icon-size"] = iconSize;
  if (shadowSize) style["--shadow-size"] = shadowSize;

  return (
    <>
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
              <li key={item.path}>
                <NavLink to={item.path} className="sidebar-item">
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <footer
          className="sidebar-footer"
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        >
          <button
            className="sidebar-item"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isProfileOpen}
            onClick={() => setIsProfileOpen(true)}
          >
            <span className="sidebar-icon">
              <UserIcon />
            </span>
            <span className="sidebar-label">Minha conta</span>
          </button>
          <button className="sidebar-item" type="button">
            <span className="sidebar-icon">
              <SettingsIcon />
            </span>
            <span className="sidebar-label">Ajustes</span>
          </button>
          <button
            className="sidebar-item"
            type="button"
            aria-pressed={theme === "dark"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <span className="sidebar-icon" aria-hidden="true">
              {theme === "dark" ? "☀" : "☾"}
            </span>
            <span className="sidebar-label">
              {theme === "dark"
                ? "Tema claro (btn provisorio)"
                : "Tema escuro (btn provisorio)"}
            </span>
          </button>
        </footer>
      </aside>

      {isProfileOpen && <ProfileModal onClose={closeProfile} />}
    </>
  );
}
