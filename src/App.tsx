import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import SmartAttendance from "./pages/SmartAttendance";
import ExamPassID from "./pages/ExamPassID";
import VerifyMe from "./pages/VerifyMe";
import AddStudent from "./pages/AddStudent";
import NotFound from "./pages/NotFound";
import GetStarted from "./pages/GetStarted";
import Presentation from "./pages/Presentation";

const queryClient = new QueryClient();

function App() {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/verify-me" element={<Layout><VerifyMe /></Layout>} />
              <Route path="/add-student" element={<Layout><AddStudent /></Layout>} />
              <Route path="/smart-attendance" element={<Layout><SmartAttendance /></Layout>} />
              <Route path="/exam-pass" element={<Layout><ExamPassID /></Layout>} />
              <Route path="/get-started" element={<Layout><GetStarted /></Layout>} />
              <Route path="/presentation" element={<Presentation />} />
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
