import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
function Users() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [addUser, setAddUser] = useState(false);
    const [data, setData] = useState({
        user_name: "",
        email: "",
        password: "",
        role: "student"
    });
    const [editUser, setEditUser] = useState(false);
    const [emailChanged, setEmailChange] = useState(false)
    const [editData, setEditData] = useState({
        user_id: "",
        user_name: "",
        email: "",
        role: "student",
    });
    const [loading, setLoading] = useState(true);
    // const filter_user = users.filter((user) => user.user_name.toLowerCase().includes(search.toLowerCase()))

    useEffect(() => {
        async function show_users() {
            try {
                const response = await fetch('http://127.0.0.1:8000/dashboard/get_users')
                const result = await response.json()
                setUsers(result)
            }
            catch (error) {
                console.error("Error fetching users:", error);
            }
            finally {
                setLoading(false)
            }
        }
        show_users();
    }, [addUser, setAddUser,editUser])

    async function new_user() {
        try {
            const token = sessionStorage.getItem("access_token");
            if (!token) {
                navigate("/login", { replace: true });
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/dashboard/add_user', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })
            const result = await response.json()
            if(!result['success']){
                setMessage(result.details)
                return
            }
            if (response.status === 401) {
                localStorage.removeItem("access_token");
                navigate("/login", {
                    replace: true,
                    state: { message: "Your session has expired. Please log in again." }
                });
                return;
            }
            if (!response.ok) {
                setMessage(result.details || "Unable to add user.");
                return;
            }
            
            // Authenticated but restricted
            if (response.status === 403) {
                setMessage("Access denied. Only administrators can add users.");
                return;
            }

            // setMessage("User created successfully!");
            setData({
                user_name: "",
                email: "",
                password: "",
                role: "student"

            });
            return true;

        } catch (error) {
            console.error("Error adding user:", error);
            setMessage("Unable to connect to the server.");
        }
    }

    const [filterBy, setFilterBy] = useState('user_name')

    const filter_user = users.filter((user) => user[filterBy].toLowerCase().includes(search.toLowerCase()))

    async function handleEdit(e) {
        e.preventDefault()
        try {
            const token = sessionStorage.getItem("access_token");
            const response = await fetch(`http://127.0.0.1:8000/user/update`,
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...editData,
                        change: emailChanged
                    })

                }
            )
            const result = await response.json()
            
            if (response.status === 403) {
                setMessage("Access denied. Only administrators can add users.");
                return;
            }
            if (!response.ok) {
                setMessage(result.detail || "Unable to update.");
                return;
            }
            setEditData({
                user_id: "",
                user_name: "",
                email: "",
                role: "student",
            })
            setEditUser(false);
            setEmailChange(false)
            setMessage("User updated successfully!");
        }
        catch (error) {
            console.error("Error adding user:", error);
            setMessage("Unable to connect to the server.");
        }
    }
    return (
        <div>
            {loading ? (<p>Loading users...</p>) : (<p>Total users = {users.length}</p>)}

            <p className="mt-2 text-slate-500">
                Manage registered users here.
            </p>
            <div className="bg-white rounded-xl shadow overflow-x-auto mt-6 max-h-100 w-auto">

                <div className="flex justify-between gap-3 p-2 w-auto sticky top-0 z-50 bg-amber-200">
                    <h1 className="text-2xl md:text-3xl text-center ml-5 p-2 font-bold text-amber-800">
                        Users
                    </h1>
                    <div className="flex justify-center items-center">
                        <p className="text-amber-700 font-bold text-sm md:text-lg w-auto m-2">Filter by:</p>
                        <div className="flex flex-col items-center m-1 text-sm md:text-md w-auto">
                            <input
                                type="radio"
                                id="user_name"
                                name="filter"
                                value="user_name"
                                checked={filterBy === 'user_name'}
                                onChange={(e) => setFilterBy(e.target.value)}
                            />
                            <label htmlFor="user_name">Username</label>
                        </div>
                        <div className="flex flex-col items-center m-1 text-sm md:text-md w-auto">
                            <input
                                type="radio"
                                id="role"
                                name="filter"
                                value="role"
                                checked={filterBy === 'role'}
                                onChange={(e) => setFilterBy(e.target.value)}
                            />
                            <label htmlFor="item">Role</label>
                        </div>

                        <input
                            onChange={(e) => { setSearch(e.target.value) }}
                            type="text"
                            placeholder="Search user..."
                            className="border bg-white border-slate-300 rounded-lg p-3 w-2/5 "
                        />
                    </div>
                </div>
                <table className="w-auto md:w-full text-left border-collapse overflow-y-auto" >
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="w-auto p-4">User ID</th>
                            <th className="w-auto p-4">Name</th>
                            <th className="w-auto p-4">Email</th>
                            <th className="w-auto p-4">Role</th>
                            <th className="w-auto p-4">Registered on</th>
                            <th className="w-auto p-4">Register time</th>
                            <th className="w-auto p-4-4">Last updated</th>
                            <th className="w-auto p-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filter_user.length > 0 ? (
                            filter_user.map((user) => (
                                <tr key={user.user_id}>
                                    <td className="p-4 border-t border-slate-200">{user.user_id}</td>
                                    <td className="p-4 border-t border-slate-200">{user.user_name}</td>
                                    <td className="p-4 border-t border-slate-200">{user.email}</td>
                                    <td className="p-4 border-t border-slate-200">{user.role}</td>
                                    <td className="p-4 border-t border-slate-200">{user.reg_time.split('T')[0]}</td>
                                    <td className="p-4 border-t border-slate-200">{user.reg_time.split('T')[1]}</td>
                                    <td className="p-4 border-t border-slate-200">{user.update_time.split('T')[0]} at {user.update_time.split('T')[1]}</td>
                                    <td className="p-4 border-t border-slate-200">
                                        <button
                                            className="pl-5 pr-5 bg-amber-200 cursor-pointer"
                                            onClick={() => {
                                                setEditData({
                                                    user_id: user.user_id,
                                                    user_name: user.user_name,
                                                    email: user.email,
                                                    role: user.role
                                                });

                                                setEditUser(true);
                                                setAddUser(false);
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </td>

                                </tr>
                            )))
                            : (
                                <tr>
                                    <td colSpan="6" className="text-center p-6 text-slate-500">
                                        No user found.
                                    </td>
                                </tr>)
                        }
                    </tbody>
                </table>
            </div>
            {editUser && (
                <form
                    className="mt-10 border-2 p-4"
                    onSubmit={handleEdit}
                >
                    <h2 className="text-xl font-bold mb-3">Edit User</h2>
                    <input
                        className="p-2 m-1 border-2"
                        type="text"
                        value={editData.user_name}
                        onChange={(e) =>
                            setEditData({ ...editData, user_name: e.target.value })
                        }
                        placeholder="Name"
                    />
                    <input
                        className="p-2 m-1 border-2"
                        type="email"
                        value={editData.email}
                        onChange={(e) => {
                            setEmailChange(true)
                            setEditData({ ...editData, email: e.target.value })
                        }
                        }
                        placeholder="Email"
                    />
                    <select
                        className="p-2 m-1 border-2"
                        value={editData.role}
                        onChange={(e) =>
                            setEditData({ ...editData, role: e.target.value })
                        }
                    >
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                    </select>

                    <div className="mt-3">
                        <button
                            type="submit"
                            className="p-2 m-1 bg-amber-500 cursor-pointer"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            className="p-2 m-1 bg-slate-300 cursor-pointer"
                            onClick={() => setEditUser(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {!editUser && addUser ?
                (
                    <form className="mt-10 border-2" onSubmit={async (e) => {
                        e.preventDefault();
                        const success = await new_user();
                        if (success) {
                            setAddUser(false);
                            setData({
                                user_name: "",
                                email: "",
                                password: "",
                                role: "student"
                            });
                            setTimeout(()=>{
                                setMessage('')
                            },3000)
                            setMessage('Added successfully!')
                        }
                    }}>
                        <input
                            className="p-1 m-1 border-2"
                            type="text"
                            placeholder="Name"
                            onChange={(e) => setData({ ...data, user_name: e.target.value })} />
                        <input
                            className="p-1 m-1 border-2"
                            type="email"
                            placeholder="Email"
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                        />
                        <input
                            className="p-1 m-1 border-2"
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                        />
                        {/* <input
                            className="p-1 m-1 border-2"
                            list="role"
                            placeholder="Select role"
                            onChange={(e) => setData({ ...data, role: e.target.value })}
                        /> */}
                        <select id="role" value={data.value} onChange={(e) => setData({ ...data, role: e.target.value })}>
                            <option value="student">Student</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button className="text-center bg-amber-600 p-1 m-1 pl-5 pr-5 border-2 cursor-pointer" type="submit">
                            Add
                        </button>
                        <button className="text-center bg-slate-200 p-1 m-1 pl-5 pr-5 border-2 cursor-pointer" type="button" onClick={()=>setAddUser(false)}>
                            Cancel
                        </button>
                    </form>
                )

                : (
                    <div className="m-10">
                        <p className="mt-3 text-center text-amber-700">
                            {message}
                        </p>

                        <button className=" pl-5 pr-5 text-center bg-amber-600 p-1 border-2 cursor-pointer" onClick={() => setAddUser(true)}>
                            Add User
                        </button>
                    </div>
                )
            }
        {addUser&&(<p className="mt-3 text-center text-amber-700">{message}</p>)}
        </div>
    )
}
export default Users
