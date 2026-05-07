import { Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import Register from './pages/Register';

function App() {
  return (
    <Routes>
      {/* The Layout component wraps our pages to show the Navbar everywhere */}
      <Route path="/" element={<Layout />}>
        {/* Landing Page Placeholder */}
        <Route index element={
          <div className="flex items-center justify-center min-h-[60vh]">
            <h1 className="text-4xl font-bold text-gray-800">Welcome to Event Manager</h1>
          </div>
        } />

        {/* Register Page Route (Phase 1 Task) */}
        <Route path="register" element={<Register />} />

        {/* Login Page Placeholder (Next Cycle) */}
        <Route path="login" element={
          <div className="flex items-center justify-center min-h-[60vh]">
            <h2 className="text-2xl">Login Page Coming Soon</h2>
          </div>
        } />
      </Route>
    </Routes>
  );
}

export default App;