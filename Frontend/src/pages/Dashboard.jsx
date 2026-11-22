import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import StudentSidebar from "../components/StudentSidebar";
import Footer from "../components/Footer";

function Dashboard() {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(sessionStorage.getItem("user") || "null");

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const role = user.role;

    return (
        <div className="min-h-screen flex bg-slate-100 w-full min-w-0">
            {role === "student" ? <StudentSidebar /> : <Sidebar />}

            <main className="flex-1 h-vh ml-30 w-full min-w-0 md:ml-50 md:w-[calc(100%-16rem)] p-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Welcome to {role} Portal
                    </h2>
                </div>

                <Outlet />
            </main>
            <Footer/>
        </div>
    );
}

export default Dashboard;