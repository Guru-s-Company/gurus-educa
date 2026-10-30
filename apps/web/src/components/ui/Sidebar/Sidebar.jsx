import "./Sidebar.css";
import { useState, useEffect, useRef } from "react";
import { cn } from "../../../lib/helpers";
import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  AwardIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  XIcon,
  UserIcon,
} from "../Icon/Icon";

/**
 * @typedef {Object} SidebarNavItem
 * @property {string} id - Unique identifier for the nav item
 * @property {string} label - Display label
 * @property {React.ReactNode} icon - Icon component
 * @property {string} [href] - Optional link href (if not using onClick)
 * @property {Function} [onClick] - Click handler
 * @property {boolean} [disabled] - Whether the item is disabled
 */

/**
 * @typedef {Object} SidebarProps
 * @property {boolean} [collapsed=false] - Whether sidebar is collapsed
 * @property {Function} [onCollapseChange] - Callback when collapse state changes
 * @property {string} [activeItem] - Currently active nav item id
 * @property {Function} [onItemClick] - Callback when nav item is clicked
 * @property {SidebarNavItem[]} [items] - Navigation items (uses default if not provided)
 * @property {Object} [user] - User info for profile section
 * @property {string} [user.name] - User name
 * @property {string} [user.email] - User email
 * @property {string} [user.avatar] - User avatar URL
 * @property {Function} [onLogout] - Logout handler
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [mobileOpen=false] - Mobile drawer open state
 * @property {Function} [onMobileOpenChange] - Mobile drawer open callback
 */

/**
 * Sidebar - A responsive navigation sidebar with neobrutalist styling.
 * Supports collapsible desktop mode and mobile drawer.
 * @param {SidebarProps} props
 * @returns {JSX.Element}
 */
export default function Sidebar({
  collapsed = false,
  onCollapseChange,
  activeItem,
  onItemClick,
  items = DEFAULT_NAV_ITEMS,
  user,
  onLogout,
  className,
  mobileOpen = false,
  onMobileOpenChange,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (e, index) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!items[index].disabled) {
          handleItemClick(items[index]);
        }
        break;
      case "Escape":
        if (mobileOpen && onMobileOpenChange) {
          onMobileOpenChange(false);
        }
        break;
      case "Tab":
        if (collapsed && !isHovered) {
          e.preventDefault();
        }
        break;
    }
  };

  const handleItemClick = (item) => {
    if (item.disabled) return;
    onItemClick?.(item.id, item);
    if (item.href) return;
    if (mobileOpen && onMobileOpenChange) {
      onMobileOpenChange(false);
    }
  };

  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    onCollapseChange?.(newCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileOpen && onMobileOpenChange) {
        onMobileOpenChange(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen, onMobileOpenChange]);

  const sidebarClassName = cn("sidebar", {
    "sidebar--collapsed": collapsed,
    "sidebar--mobile-open": mobileOpen,
  });

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar__overlay"
          onClick={() => onMobileOpenChange?.(false)}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        className={cn(sidebarClassName, className)}
        role="navigation"
        aria-label="Navegação principal"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="sidebar__brand">
          {!collapsed && (
            <div className="sidebar__brand-content">
              <div className="sidebar__brand-icon" aria-hidden="true">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="32"
                    height="32"
                    rx="8"
                    fill="var(--color-roxo)"
                  />
                  <path
                    d="M8 16L14 22L24 10"
                    stroke="var(--color-foreground)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="sidebar__brand-text">Guru's Educa</span>
            </div>
          )}
          <button
            className="sidebar__toggle"
            onClick={toggleCollapse}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            aria-controls="sidebar-nav"
          >
            {collapsed ? (
              <ChevronRightIcon size={20} aria-hidden="true" />
            ) : (
              <ChevronLeftIcon size={20} aria-hidden="true" />
            )}
          </button>
        </div>

        <nav
          id="sidebar-nav"
          className="sidebar__nav"
          role="list"
          aria-label="Menu de navegação"
        >
          <ul className="sidebar__list" role="list">
            {items.map((item, index) => (
              <li key={item.id} className="sidebar__list-item">
                <button
                  className={cn(
                    "sidebar__item",
                    item.id === activeItem && "sidebar__item--active",
                    item.disabled && "sidebar__item--disabled",
                    index === focusedIndex && "sidebar__item--focused"
                  )}
                  onClick={() => handleItemClick(item)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={item.disabled}
                  aria-current={item.id === activeItem ? "page" : undefined}
                  aria-disabled={item.disabled || undefined}
                  tabIndex={collapsed && !isHovered ? -1 : 0}
                >
                  <span className="sidebar__item-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="sidebar__item-label">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {user && !collapsed && (
          <div className="sidebar__footer">
            <div className="sidebar__user">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="sidebar__user-avatar"
                  width="40"
                  height="40"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="sidebar__user-avatar sidebar__user-avatar--placeholder" aria-hidden="true">
                  <UserIcon size={20} />
                </div>
              )}
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">{user.name}</span>
                <span className="sidebar__user-email">{user.email}</span>
              </div>
            </div>
            {onLogout && (
              <button
                className="sidebar__logout"
                onClick={onLogout}
                aria-label="Sair da conta"
              >
                <LogOutIcon size={18} aria-hidden="true" />
                <span className="sidebar__logout-label">Sair</span>
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

const DEFAULT_NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <HomeIcon size={20} aria-hidden="true" />,
  },
  {
    id: "students",
    label: "Estudantes",
    icon: <UsersIcon size={20} aria-hidden="true" />,
  },
  {
    id: "courses",
    label: "Cursos",
    icon: <BookOpenIcon size={20} aria-hidden="true" />,
  },
  {
    id: "achievements",
    label: "Conquistas",
    icon: <AwardIcon size={20} aria-hidden="true" />,
  },
  {
    id: "settings",
    label: "Configurações",
    icon: <SettingsIcon size={20} aria-hidden="true" />,
  },
];

export function SidebarMobileToggle({ mobileOpen, onClick }) {
  return (
    <button
      className="sidebar__mobile-toggle"
      onClick={onClick}
      aria-expanded={mobileOpen}
      aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
      aria-controls="sidebar"
    >
      {mobileOpen ? (
        <XIcon size={24} aria-hidden="true" />
      ) : (
        <MenuIcon size={24} aria-hidden="true" />
      )}
    </button>
  );
}