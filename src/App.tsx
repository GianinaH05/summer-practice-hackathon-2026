import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Event from "./pages/Event";
import Pevents from "./pages/Pevents";
export default function App() {
  return (
      <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/event" element={<Event />} />
          <Route path="/pevents" element={<Pevents />} />
      </Routes>
      </Layout>
  );
}