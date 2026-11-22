import { useState, useEffect } from "react";
function Home() {
    const [activities, setActivities] = useState([])
    useEffect(() => {
        async function fetch_history() {
            const response = await fetch("http://127.0.0.1:8000/history");
            const result = await response.json()
            setActivities(result)
        }
        fetch_history();
    }, [])

    const [activePage, setActivePage] = useState('Dashboard')

    const [totalusers, setTotalUsers] = useState(0)
    useEffect(() => {
        async function fetchUsers() {
            const response = await fetch("http://127.0.0.1:8000/dashboard/users");
            const result = await response.json()
            setTotalUsers(result.total_users)
        }
        fetchUsers();
    }, [])

    const [inv_count, setInvCount] = useState(0)
    useEffect(() => {
        async function fetch_inventory_count() {
            const response = await fetch('http://127.0.0.1:8000/dashboard/inventory_count')
            const result = await response.json()
            setInvCount(result.total)
        }
        fetch_inventory_count();
    }, [])

    const [req_count, setReqCount] = useState(0)
    useEffect(() => {
        async function fetch_request_count() {
            const response = await fetch('http://127.0.0.1:8000/dashboard/requests')
            const result = await response.json()
            setReqCount(result.total)
        }
        fetch_request_count();
    }, [])

    const [total_loans, setTotalLoans] = useState(0)
    useEffect(() => {
        async function fetch_total_loans() {
            const response = await fetch('http://127.0.0.1:8000/dashboard/loans')
            const result = await response.json()
            setTotalLoans(result.total)
        }
        fetch_total_loans();
    }, [])

    const [totalUserRequests, settotalUserRequests] = useState(0)
    useEffect(() => {
        async function fetch_request_count() {
            const token = sessionStorage.getItem("access_token");
            const response = await fetch('http://127.0.0.1:8000/home/userRequests', {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            const result = await response.json()
            // console.log(result.total);

            settotalUserRequests(result.total)
        }
        fetch_request_count();
    }, [])


    const [totalUserLoans, settotalUserLoans] = useState(0)
    useEffect(() => {
        async function fetch_loan_count() {
            const token = sessionStorage.getItem("access_token");
            const response = await fetch('http://127.0.0.1:8000/home/userLoans', {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            const result = await response.json()
            // console.log(result.total);

            settotalUserLoans(result.total)
        }
        fetch_loan_count();
    }, [])

    const [totalReturnedLoans, settotalReturnedLoans] = useState(0)
    useEffect(() => {
        async function fetch_return_count() {
            const token = sessionStorage.getItem("access_token");
            const response = await fetch('http://127.0.0.1:8000/home/ReturnedLoaninfo', {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            const result = await response.json()
            // console.log(result);
            settotalReturnedLoans(result)
        }
        fetch_return_count();
    }, [])

    const user = JSON.parse(sessionStorage.getItem("user") || "null");
    const role = user['role']
    const isAdmin = user?.role === 'admin' || user?.role === 'staff';
    // console.log(role);

    return (
        <div>
            <p className="mt-2 text-slate-500">
                Welcome to your Lab Borrowing Management System.
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
                {activePage}
            </h1>
            {activePage === "Dashboard" && isAdmin && (
                <div >
                    <div className=" mt-10 grid grid-cols-4 grid-rows-1 gap-5 mb-10">
                        <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-between ">
                            <h2 className="text-slate-500 text-sm">
                                Total Inventory
                            </h2>
                            <p className="text-4xl font-bold text-amber-800 mt-2">
                                {inv_count}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-between ">
                            <h2 className="text-slate-500 text-sm">
                                Registered users
                            </h2>
                            <p className="text-4xl font-bold text-slate-800 mt-2">
                                {totalusers}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-between ">
                            <h2 className="text-slate-500 text-sm">
                                Pending requests
                            </h2>
                            <p className="text-4xl font-bold text-slate-800 mt-2">
                                {req_count}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-between ">
                            <h2 className="text-slate-500 text-sm">
                                Active Loans
                            </h2>
                            <p className="text-4xl font-bold text-slate-800 mt-2">
                                {total_loans}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-y-auto h-100">
                        <h2 className=" text-3xl font-bold  text-center sticky top-0 bg-slate-100 z-50 border-b-2">Recent Activity</h2>
                        <table className="w-full text-left border-collapse relative">
                            <thead className="bg-slate-100 text-slate-600 sticky top-9.5 z-50 ">
                                <tr>
                                    <th className="p-4">Request_id</th>
                                    <th className="p-4">Previous status</th>
                                    <th className="p-4">Current status</th>
                                    <th className="p-4">Changed By</th>
                                    <th className="p-4">Change Time</th>
                                    {/* <th className="p-4"></th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {activities.map((act) => (
                                    <tr key={act.log_id}>
                                        <td className="p-4 border-t border-slate-200">{act.req_id}</td>
                                        <td className="p-4 border-t border-slate-200">{act.old_status}</td>
                                        <td className="p-4 border-t border-slate-200">{act.new_status}</td>
                                        <td className="p-4 border-t border-slate-200">{act.changed_by}</td>
                                        <td className="p-4 border-t border-slate-200">{act.changed_at ? (act.changed_at.split('T')[1]) : ("N/A")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {activePage === "Dashboard" && role === 'student' && (
                <div>
                    <div className=" mt-10 grid grid-cols-2 grid-rows-1 gap-10 min-h-50">
                        <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-between items-center gap-5">
                            <h2 className="text-slate-500 text-3xl">
                                Total Inventory
                            </h2>
                            <p className="text-6xl font-bold text-amber-800 mt-2">
                                {inv_count}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-between items-center gap-5">
                            <h2 className="text-slate-500 text-3xl">
                                My requests
                            </h2>
                            <p className="text-6xl font-bold text-slate-800 mt-2">
                                {totalUserRequests}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-between items-center gap-5">
                            <h2 className="text-slate-500 text-3xl">
                                Active Loans
                            </h2>
                            <p className="text-6xl font-bold text-slate-800 mt-2">
                                {totalUserLoans}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-between items-center gap-5">
                            <h2 className="text-slate-500 text-3xl">
                                Returned Loans
                            </h2>
                            <p className="text-6xl font-bold text-slate-800 mt-2">
                                {totalReturnedLoans}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home
