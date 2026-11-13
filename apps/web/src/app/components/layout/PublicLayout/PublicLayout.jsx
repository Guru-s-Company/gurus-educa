import { Outlet } from "react-router-dom";
import BackgroundShapes from "../Background/Background";
import "./PublicLayout.css";

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <BackgroundShapes />
      <main className="public-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
