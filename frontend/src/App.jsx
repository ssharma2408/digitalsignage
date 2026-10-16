import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import Welcome from "./pages/public/Welcome";
import Staff from "./pages/public/Staff";
import Gallery from "./pages/public/Gallery";
import SignagePlayer from "./pages/public/SignagePlayer";
import Attendance from "./pages/public/Attendance";

import Login from "./pages/admin/Login";
import Register from "./pages/admin/Register";
import Dashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import WelcomeAdmin from "./pages/admin/Welcome";
import StaffAdmin from "./pages/admin/Staff";
import GalleryAdmin from "./pages/admin/Gallery";
import StudentAttendance from "./pages/admin/StudentAttendance";
//import Media from "./pages/admin/Media";

export default function App() {

    return (
        <BrowserRouter>

            <Routes>
                <Route path="/signage-player" element={<SignagePlayer />} />
                <Route path="/" element={<Welcome />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/staff" element={<Staff />} />                
                <Route
                    path="/gallery/:slug"
                    element={<Gallery />}
                />
                <Route path="/attendance" element={<Attendance />} />
                <Route
                    path="/admin/login"
                    element={<Login />}
                />

                <Route
                    path="/admin/register"
                    element={<Register />}
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/welcome"
                        element={
                            <ProtectedRoute>
                                <WelcomeAdmin />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/staff"
                        element={
                            <ProtectedRoute>
                                <StaffAdmin />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/galleries"
                        element={
                            <ProtectedRoute>
                                <GalleryAdmin />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                    path="/admin/attendance"
                    element={
                            <ProtectedRoute>
                                <StudentAttendance />
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </Routes>

        </BrowserRouter>
    );
}