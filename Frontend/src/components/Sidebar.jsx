
import { NavLink, useNavigate } from 'react-router-dom'
import { hasPermission } from "../components/permissions";

function Sidebar() {
    const navigate = useNavigate();
    const user = JSON.parse(
        sessionStorage.getItem("user") || "null"
    );
    async function handleLogout() {
        const token = sessionStorage.getItem("access_token");
        try {

            const response = await fetch("http://127.0.0.1:8000/logout", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                setTimeout(() => {
                    navigate("/login");
                }, 1000)
            }
        }
        catch (error) {
            console.error("Logout failed:", error);
        }
        finally {
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("user");
            navigate("/login", { replace: true });
        }
    }

    return (
        <nav className="fixed left-0 h-screen w-30 md:w-50 bg-slate-900 text-white p-6 flex flex-col gap-15">
            <h1 className="pt-5 text-2xl font-bold">
                Lab Manager
            </h1>

            <ul className="space-y-4">
                {[
                    { name: "Dashboard", path: "/dashboard", page: "home" },
                    { name: "Catagories", path: "/dashboard/catagory", page: "catagory" },
                    { name: "Inventory", path: "/dashboard/inventory", page: "inventory" },
                    { name: "Users", path: "/dashboard/users", page: "users" },
                    { name: "Borrow Requests", path: "/dashboard/borrow_requests", page: "borrow_requests" },
                    { name: "Active Loans", path: "/dashboard/loans", page: "loans" },
                    { name: "Reports", path: "/dashboard/reports", page: "reports" }
                ]
                    .filter(item => hasPermission(user?.role, item.page))
                    .map(item => (
                        <li key={item.page}>
                            <NavLink
                                to={item.path}
                                end
                                className={({ isActive }) =>
                                    `block p-2 rounded-lg transition ${isActive
                                        ? "bg-slate-700 text-amber-400"
                                        : "hover:bg-slate-800 hover:text-amber-400"
                                    }`
                                }
                            >
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
            </ul>

            <button
                onClick={handleLogout}
                className="cursor-pointer w-full p-3 rounded-lg bg-red-600 hover:bg-red-700 transition text-white"
            >
                Logout
            </button>
        </nav>
    )
}

export default Sidebar
