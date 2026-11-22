import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        let active = true;
        async function verifyToken() {
            const token = sessionStorage.getItem("access_token");
            if (!token) {
                setIsAuthenticated(false);
                return;
            }
            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (!active) return;

                if (response.status === 401) {
                    localStorage.removeItem("access_token");
                    sessionStorage.removeItem("user");
                    setIsAuthenticated(false);
                    return;
                }

                if (!response.ok) {
                    setIsAuthenticated(false);
                    return;
                }

                const user = await response.json();

                sessionStorage.setItem("user", JSON.stringify(user));
                setIsAuthenticated(true);

            } catch (error) {
                console.error("Authentication error:", error);
                if (active) setIsAuthenticated(false);
            }
        }

        setIsAuthenticated(null);
        verifyToken();

        return () => {
            active = false;
        };

    }, [location.pathname]);

    if (isAuthenticated === null) {
        return <p>Verifying session...</p>;
    }

    if (!isAuthenticated) {
        alert("Not logged In or session expired!")
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
