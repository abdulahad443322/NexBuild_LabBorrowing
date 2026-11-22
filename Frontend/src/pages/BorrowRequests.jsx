
import { useCallback, useEffect, useState } from 'react';
import { data } from 'react-router-dom';
function BorrowRequests() {

    const [requests, setRequests] = useState([]);
    const [userRequests, setUserRequests] = useState([]);

    const [search, setSearch] = useState('');
    const [filterBy, setFilterBy] = useState('borrower_name');

    const [dueDate, setDueDate] = useState('');
    const [issue, setIssue] = useState(null);
    const [approve, setApprove] = useState(null);
    const [reject, setReject] = useState(null);

    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    const isAdmin = user?.role === 'admin' || user?.role === 'staff';

    const [issuedRequests, setIssuedRequests] = useState([]);
    async function get_a_loan(request_id) {
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/loan/get?request_id=${request_id}`
            );

            const result = await response.json();

            console.log("Loan result:", result);

            if (result.success) {
                setIssuedRequests(prev =>
                    prev.includes(request_id)
                        ? prev
                        : [...prev, request_id]
                );
            }

        } catch (error) {
            console.log(error);
        }
    }
    // Fetch all requests 
    const get_requests= useCallback(async () =>{
        try {
            const response = await fetch(
                'http://127.0.0.1:8000/dashboard/get_requests'
            );

            const result = await response.json();

            if (response.ok) {
                setRequests(result);
                setIssuedRequests([]);
                result.filter(req => req.status === 'approved').forEach(req => {
                        get_a_loan(req.request_id);
                    });
            }
        } catch (error) {
            console.log(error);
        }
    },[issue,approve])
    useEffect(() => {
        get_requests()
    }, [issue, approve,get_requests])

    // Fetch current user's requests
    async function get_user_requests() {
        try {
            const token = sessionStorage.getItem("access_token");

            const response = await fetch(
                'http://127.0.0.1:8000/home/userRequestinfo',
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const result = await response.json();
            if (response.ok) {
                setUserRequests(result);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (isAdmin) {
            get_requests();
        } else {
            get_user_requests();
        }
    }, [approve, data, issue]);

    // Issue loan
    async function issue_loan(request_id,item_id) {
        if (!dueDate) {
            alert('Please select a due date');
            return;
        }
        const token = sessionStorage.getItem("access_token");
        try {
            const response = await fetch(
                'http://127.0.0.1:8000/loans/issue',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        request_id: request_id,
                        item_id:item_id,
                        due_date: dueDate
                    })
                }
            );

            const result = await response.json();

            if (response.ok) {
                alert(result.message);

                setIssue(null);
                setDueDate('');

                get_requests();
            } 
            else {
                alert(result.details);
                setIssue(null);
                setDueDate('');
            }

        } catch (error) {
            console.log(error);
        }
    }

    async function approve_request(request_id, item_id) {
        const token = sessionStorage.getItem("access_token");
        try {
            const response = await fetch(
                'http://127.0.0.1:8000/requests/approve',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        item_id: item_id,
                        request_id: request_id
                    })
                }
            );

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                setApprove(null);
                setReject(null);
                get_requests();
            } else {
                alert(result.detail || result.message);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async function reject_request(request_id, item_id) {
        const token = sessionStorage.getItem("access_token");
        try {
            const response = await fetch(
                'http://127.0.0.1:8000/requests/reject',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        item_id: item_id,
                        request_id: request_id
                    })
                }
            );

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                setApprove(null);
                setReject(null);
                get_requests();
            } else {
                alert(result.detail || result.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function cancel_request(request_id) {
    const token = sessionStorage.getItem("access_token");

    try {
        const response = await fetch(
            'http://127.0.0.1:8000/requests/cancel',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ request_id })
            }
        );

        const result = await response.json();

        if (response.ok && result.success) {
            alert(result.message);

            setUserRequests(prev =>
                prev.map(req =>
                    req.request_id === request_id
                        ? { ...req, status: 'cancelled' }
                        : req
                )
            );
        } else {
            alert(result.detail || result.message);
        }
    } catch (error) {
        console.log(error);
    }
}

    // Filtering
    const currentRequests = isAdmin ? requests : userRequests;

    const filteredRequests = currentRequests.filter((req) =>
        String(req[filterBy] ?? '')
            .toLowerCase()
            .includes(search.toLowerCase())
    );


    return (
        <>
            <div>
                <h1 className="text-3xl font-bold text-slate-800">
                    Borrow Requests
                </h1>

                <p className="mt-2 text-slate-500">
                    Manage and review borrowing requests here.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow overflow-x-auto mt-6 max-h-150 ">

                {/* Header and Search */}
                <div className="flex justify-between gap-3 p-2 sticky top-0 z-50 bg-amber-200">

                    <h1 className="text-xl md:text-3xl ml-5 p-2 font-bold text-amber-800">
                        Requests
                    </h1>

                    <div className="flex justify-center items-center gap-2">

                        <p className="text-amber-700 font-bold text-sm md:text-lg">
                            Filter by:
                        </p>

                        {/* Borrower Filter */}
                        <div className="flex flex-col items-center text-sm">
                            <input
                                type="radio"
                                id="borrower"
                                name="filter"
                                value="borrower_name"
                                checked={filterBy === 'borrower_name'}
                                onChange={(e) => setFilterBy(e.target.value)}
                            />
                            <label htmlFor="borrower">
                                Borrower
                            </label>
                        </div>

                        {/* Item Filter */}
                        <div className="flex flex-col items-center text-sm">
                            <input
                                type="radio"
                                id="item"
                                name="filter"
                                value="item_name"
                                checked={filterBy === 'item_name'}
                                onChange={(e) => setFilterBy(e.target.value)}
                            />
                            <label htmlFor="item">
                                Item
                            </label>
                        </div>

                        {/* Status Filter */}
                        <div className="flex flex-col items-center text-sm">
                            <input
                                type="radio"
                                id="status"
                                name="filter"
                                value="status"
                                checked={filterBy === 'status'}
                                onChange={(e) => setFilterBy(e.target.value)}
                            />
                            <label htmlFor="status">
                                Status
                            </label>
                        </div>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="border border-slate-300 bg-white rounded-lg p-3 w-2/5"
                        />

                    </div>
                </div>

                {/* Requests Table */}
                <table className="w-full text-left border-collapse ">

                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="p-4">Request ID</th>
                            <th className="p-4">Request By</th>
                            <th className="p-4">Requested Item</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Request Date</th>
                            <th className="p-4">Reviewed By</th>

                            {isAdmin && (
                                <th className="p-4">Actions</th>
                            )}
                            <th className="p-4"></th>
                        </tr>
                    </thead>

                    <tbody>

                        {filteredRequests.length > 0 ? (

                            filteredRequests.map((req) => (

                                <tr key={req.request_id}>

                                    <td className="p-4 border-t border-slate-200">
                                        {req.request_id}
                                    </td>

                                    <td className="p-4 border-t border-slate-200">
                                        {req.borrower_name}
                                    </td>

                                    <td className="p-4 border-t border-slate-200">
                                        {req.item_name}
                                    </td>

                                    <td className="p-4 border-t border-slate-200">
                                        {req.status}
                                    </td>

                                    <td className="p-4 border-t border-slate-200">
                                        {req.request_time
                                            ? req.request_time.split('T')[0]
                                            : 'N/A'}
                                    </td>

                                    <td className="p-4 border-t border-slate-200">
                                        {isAdmin
                                            ? req.reviewed_by
                                            : req.reviewer_name}
                                    </td>

                                    {!isAdmin && req.status === 'pending' && (
                                    <td className="p-4 border-t border-slate-200">
                                        <button
                                        type="button"
                                        onClick={() => cancel_request(req.request_id)}
                                        className="cursor-pointer px-3 py-2 bg-red-600 text-white rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    </td>
                                    )
                                }
                                    {/* Admin Actions */}
                                    {isAdmin && (
                                        <td className="p-4 border-t border-slate-200">

                                            <div className="flex flex-col gap-2">

                                                {/* Pending Requests */}
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => approve_request(req.request_id, req.item_id)}
                                                            className="cursor-pointer px-3 py-2 bg-blue-600 text-white rounded-lg"
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => reject_request(req.request_id, req.item_id)}
                                                            className="cursor-pointer px-3 py-2 bg-slate-400 text-white rounded-lg"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {/* Approved Requests */}
                                                {req.status === 'approved' && (

                                                    issuedRequests.includes(req.request_id) ? (
                                                        <p className="text-red-700 font-bold">Issued!</p>

                                                    ) : (

                                                        issue !== req.request_id ? (

                                                            <button
                                                                type="button"
                                                                onClick={() => setIssue(req.request_id)}
                                                                className="cursor-pointer px-3 py-2 bg-amber-300 rounded-lg"
                                                            >
                                                                Issue Loan
                                                            </button>

                                                        ) : (

                                                            <div className="flex flex-col gap-1">

                                                                <input
                                                                    type="date"
                                                                    value={dueDate}
                                                                    onChange={(e) => setDueDate(e.target.value)}
                                                                    className="border border-amber-700 rounded-lg pl-1 pr-1 w-25"
                                                                />

                                                                <div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => issue_loan(req.request_id,req.item_id)}
                                                                        className="bg-amber-700 cursor-pointer text-white rounded-lg pl-2 pr-2"
                                                                    >
                                                                        OK
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setIssue(null);
                                                                            setDueDate('');
                                                                        }}
                                                                        className="cursor-pointer bg-slate-200 rounded-lg pl-2 pr-2 ml-2"
                                                                    >
                                                                        X
                                                                    </button>
                                                                </div>

                                                            </div>
                                                        )
                                                    )
                                                )}
                                                {req.status==='rejected'&&(
                                                    <p className='text-red-700 font-bold'>Rejected!</p>
                                        
                                                )}
                                            </div>

                                        </td>
                                    )}

                                </tr>
                            ))

                        ) : (

                            <tr>
                                <td
                                    colSpan={isAdmin ? 7 : 6}
                                    className="text-center p-6 text-slate-500"
                                >
                                    No request found.
                                </td>
                            </tr>

                        )}

                    </tbody>

                </table>

            </div>
        </>
    );
}

export default BorrowRequests;
