import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Predictor from "./pages/Predictor";
import Analytics from "./pages/Analytics";
import ModelPerformance from "./pages/ModelPerformance";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-6 lg:p-8 max-w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/predictor" element={<Predictor />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/model-performance" element={<ModelPerformance />} />
            </Routes>
          </div>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1E293B",
            color: "#F1F5F9",
            border: "1px solid #334155",
            borderRadius: "0.75rem",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#10B981", secondary: "#fff" } },
          error: { iconTheme: { primary: "#F43F5E", secondary: "#fff" } },
        }}
      />
    </BrowserRouter>
  );
}
