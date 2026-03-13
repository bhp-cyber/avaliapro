import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import DashboardPage from "./pages/DashboardPage";
import ReviewsPage from "./pages/ReviewsPage";
import ProductsPage from "./pages/ProductsPage";
import SettingsPage from "./pages/SettingsPage";
import NewReviewPage from "./pages/NewReviewPage";
import { ReviewsProvider } from "./context/ReviewsContext";

function App() {
  return (
    <ReviewsProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/new-review" element={<NewReviewPage />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ReviewsProvider>
  );
}

export default App;
