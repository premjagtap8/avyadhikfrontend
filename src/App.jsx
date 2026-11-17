import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/home/Home";
import AdvisorForm from "./pages/enquiry/AdvisorForm";
import Browse from "./pages/browse/Browse";
import LocationPage from "./pages/browse/LocationPage";
import carePage from "./pages/browse/CarePage";
import HomeDetails from "./pages/HomeDetails/HomeDetails";
import BookingRequest from "./pages/bookingRequest/BookingRequest";
import ListProperty from "./pages/listProperty/ListProperty";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Public site: the main Navbar and the Footer stay, only the page between them changes
function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages (main Navbar + Footer) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/homes/:slug" element={<HomeDetails />} />
          <Route path="/booking/:slug" element={<BookingRequest />} />
          <Route path="/assisted-living/:citySlug" element={<LocationPage />} />
          <Route path="/care/:careSlug" element={<CarePage />} />
          <Route path="/advisor" element={<AdvisorForm />} />
          <Route path="/list-your-property" element={<ListProperty />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Admin pages (admin navbar). Each child page replaces only the Outlet. */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="requests" replace />} />
          <Route path="requests" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
