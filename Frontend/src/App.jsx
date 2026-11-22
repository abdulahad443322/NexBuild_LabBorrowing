import { Navigate, Route, Routes } from "react-router-dom";
import {
    Dashboard, Login, Home, Inventory, Catagory,
    Users, BorrowRequests, Loans, Reports
} from "./pages/index";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    const user = JSON.parse(sessionStorage.getItem("user") || "null");
    const isAdmin = user?.role === "admin";
    const isStaff = user?.role === "staff";

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Home />} />

                <Route path="inventory" element={<Inventory />} />
                <Route path="catagory" element={
                    isAdmin || isStaff ? <Catagory /> : <Navigate to="/unauthorized" replace />
                } />
                <Route path="users" element={
                    isAdmin || isStaff ? <Users /> : <Navigate to="/unauthorized" replace />
                } />
                <Route path="borrow_requests" element={<BorrowRequests />} />
                <Route path="loans" element={<Loans />} />
                <Route path="reports" element={
                    isAdmin || isStaff ? <Reports /> : <Navigate to="/unauthorized" replace />
                } />
            </Route>

            <Route
                path="/unauthorized"
                element={<h1>403 - Access Denied</h1>}
            />
        </Routes>
    );
}

export default App;