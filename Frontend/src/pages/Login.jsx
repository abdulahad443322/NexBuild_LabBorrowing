import { useState } from "react";
import { useNavigate,NavLink } from "react-router-dom";
function Login() {
    const navigate = useNavigate()
    const [data, setData] = useState({ email: '', password: '' })
    const [message, setMessage] = useState("");
    async function submit_form(e) {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                sessionStorage.setItem("access_token", result.access_token);
                sessionStorage.setItem("user", JSON.stringify(result.user));
                window.location.href = "/dashboard";
                setMessage(result.message);
                setTimeout(()=>{
                    navigate("/dashboard");
                },1000)
            }
            else {
                setTimeout(()=>{
                    setMessage('')
                },5000)
                setMessage(result.detail)
            }

            console.log("Status:", response.status);

            // const result = await response.json();

            console.log("Backend response:", result);

        } catch (error) {
            console.error("Request failed:", error);
        }
    }
    return (
        <div class='loginpage' className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-slate-800">
                    Welcome To Borrow Portal
                </h1>
                <p className="text-center text-slate-500 mt-2">
                    Login to your account
                </p>

                <form onSubmit={submit_form} className="mt-8 space-y-5">
                    <div>
                        <label htmlFor="email" className="block mb-2 font-medium">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Enter Email"
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2 font-medium">
                            Password
                        </label>

                        <input
                            name='password'
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="cursor-pointer w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                </form>

                <h4 className="text-green-800 font-bold text-2xl m-5 text-center">{message}</h4>
            </div>
        </div>
    );
}

export default Login;