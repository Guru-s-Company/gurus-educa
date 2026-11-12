import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Home from "./views/Home/Home";
import Community from "./views/Community/Community";
import Login from "./views/Login/Login";
import Courses from "./views/Courses/Courses";
import Achievements from "./views/Achievements/Achievements";
import CommunityServer from "./views/CommunityServer/CommunityServer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cursos" element={<Courses />} />
          <Route path="/comunidades" element={<Community />} />
          <Route path="/comunidades/:communityId" element={<CommunityServer />} />
          <Route path="/conquistas" element={<Achievements />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;