import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicLayout from "./components/layout/PublicLayout/PublicLayout";
import Home from "../features/home/pages/HomePage";
import Community from "../features/community/pages/CommunityPage";
import Login from "../features/auth/pages/LoginPage";
import Register from "../features/auth/pages/RegisterPage";
import Courses from "../features/courses/pages/CoursesPage";
import Achievements from "../features/achievements/pages/AchievementsPage";
import CommunityServer from "../features/community/pages/CommunityServerPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/cursos" element={<Courses />} />
            <Route path="/comunidades" element={<Community />} />
            <Route path="/comunidades/:communityId" element={<CommunityServer />} />
            <Route path="/conquistas" element={<Achievements />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;