import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import HomePage from "@/pages/HomePage";
import ConfirmationPage from "./pages/ConfirmationPage";
import PrivateRoute from "./components/auth/PrivateRoute";
import PublicRoute from "./components/auth/PublicRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route path="/:id_barang/confirmation" element={<ConfirmationPage />} />
      </Route>
    </Routes>
  );
}

export default App;
