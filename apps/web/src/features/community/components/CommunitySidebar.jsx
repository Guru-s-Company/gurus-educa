import { menuItems } from "../mocks/communityMocks";

export default function CommunitySidebar({ selectedMenu, onSelectMenu }) {
  return (
    <aside className="community-server__sidebar">
      <h2>Menu</h2>
      <ul className="community-server__menu" role="radiogroup" aria-label="Seções do servidor">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={selectedMenu === item.id ? "is-selected" : ""}
            role="presentation"
          >
            <button
              type="button"
              role="radio"
              aria-checked={selectedMenu === item.id}
              onClick={() => onSelectMenu(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
