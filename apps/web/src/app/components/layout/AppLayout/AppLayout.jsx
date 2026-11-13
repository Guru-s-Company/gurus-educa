import BackgroundShapes from "../Background/Background";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="app-layout">
      <BackgroundShapes />
      <Sidebar />

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}