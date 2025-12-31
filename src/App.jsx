import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TestPage from "./pages/TestPage";
import Layout from "./components/Layout";
import NotFound from "./pages/states/NotFound";
import PrePayPage from "./pages/PrePayPage";
import PaymentResult from "./pages/PaymentResult";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test/:testId" element={<TestPage />} />
          <Route path="/test/:testId/prepay" element={<PrePayPage />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
