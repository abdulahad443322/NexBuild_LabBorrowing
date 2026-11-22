import { useEffect, useState, useCallback } from "react"

function Loans() {
    const [returnLoan, setReturnLoan] = useState(null);
    const [returnCondition, setReturnCondition] = useState('good');
    const [notes, setNotes] = useState('');

    const [loans, setLoans] = useState([])
    const show_loans = useCallback(async () => {
        try {
            const response = await fetch(
                'http://127.0.0.1:8000/loans/show'
            );

            const result = await response.json();

            if (response.ok) {
                setLoans(result);
            }
        } catch (error) {
            console.log(error);
        }
    }, []);


    const [userloans, setUserLoans] = useState([])

    useEffect(() => {
        async function show_user_loan() {
            const token = sessionStorage.getItem("access_token");
            const response = await fetch('http://127.0.0.1:8000/home/userLoaninfo', {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            const result = await response.json()
            setUserLoans(result)
        }
        show_user_loan()
    }, [])

    const return_item = useCallback(async (loan_id,item_id) =>{
        if (!returnCondition.trim()) {
            alert("Please enter the return condition");
            return;
        }

        const token = sessionStorage.getItem("access_token");

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/loans/return',
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        loan_id: loan_id,
                        item_id:item_id,
                        return_condition: returnCondition,
                        notes: notes
                    })
                }
            );

            const result = await response.json();

            if (response.ok || result['success']) {
                
                // Update only the returned loan
                alert(result.message);
                setReturnLoan(null);
                setReturnCondition('good');
                setNotes('');
                show_loans()

            } else {
                alert(result.message || result.details);
            }

        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        show_loans();
    }, [show_loans, return_item]);
    const user = JSON.parse(sessionStorage.getItem("user"));
    const role = user['role']
    return (
        <>
            <div>
                <h1>Loans</h1>
            </div>

            {role === 'admin'||role==='staff' ?
                (<div className="bg-white rounded-xl shadow overflow-x-auto mt-6">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="p-4">Loan ID</th>
                                <th className="p-4">Requested By</th>
                                <th className="p-4">Requested Item</th>
                                <th className="p-4">Issue Date</th>
                                <th className="p-4">Due Date</th>
                                <th className="p-4">Return Status</th>
                                <th className="p-4"></th>
                                {/* <th className="p-4">Reviwed By</th>
                            <th className="p-4">Note</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {loans.map((loan) => (
                                <tr key={loan.loan_id}>
                                    <td className="p-4 border-t border-slate-200">{loan.loan_id}</td>
                                    <td className="p-4 border-t border-slate-200">{loan.user_name}</td>
                                    <td className="p-4 border-t border-slate-200">{loan.item_name}</td>
                                    <td className="p-4 border-t border-slate-200">{loan.issued_at.split('T')[0]}</td>
                                    <td className="p-4 border-t border-slate-200">{loan.due_date}</td>
                                    <td className="p-4 border-t border-slate-200">{loan.is_returned}</td>
                                    <td className="p-4 border-t border-slate-200">
                                        {!loan.is_returned ? (
                                            returnLoan === loan.loan_id ? (
                                                <div className="flex flex-col gap-2">
                                                    
                                                    <select onChange={(e) => setReturnCondition(e.target.value)} className="border rounded-lg p-2" value={returnCondition} name="returnCondition" id="ret_cond">
                                                        <option value="good">Good</option>
                                                        <option value="fair">Fair</option>
                                                        <option value="damaged">Damaged</option>
                                                    </select>

                                                    <textarea
                                                        placeholder="Notes (optional)"
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                        className="border rounded-lg p-2"
                                                    />

                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => return_item(loan.loan_id,loan.item_id)}
                                                            className= "cursor-pointer bg-green-600 text-white px-3 py-2 rounded-lg"
                                                        >
                                                            Confirm
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setReturnLoan(null);
                                                                setReturnCondition('');
                                                                setNotes('');
                                                            }}
                                                            className= "cursor-pointer bg-slate-400 text-white px-3 py-2 rounded-lg"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setReturnLoan(loan.loan_id)}
                                                    className="cursor-pointer bg-blue-600 text-white px-3 py-2 rounded-lg"
                                                >
                                                    Return
                                                </button>
                                            )
                                        ) : (
                                            <p className="text-green-700">Returned</p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>)
                :
                (<div className="bg-white rounded-xl shadow overflow-x-auto mt-6">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="p-4">Loan ID</th>
                                <th className="p-4">Requested By</th>
                                <th className="p-4">Requested Item</th>
                                <th className="p-4">Issue Date</th>
                                <th className="p-4">Due Date</th>
                                <th className="p-4">Return Status</th>
                                <th className="p-4"></th>
                                {/* <th className="p-4">Reviwed By</th>
                            <th className="p-4">Note</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {userloans.length > 0 ?
                                (userloans.map((loan) => (
                                    <tr key={loan.loan_id}>
                                        <td className="p-4 border-t border-slate-200">{loan.loan_id}</td>
                                        <td className="p-4 border-t border-slate-200">{loan.user_name}</td>
                                        <td className="p-4 border-t border-slate-200">{loan.item_name}</td>
                                        <td className="p-4 border-t border-slate-200">{loan.issued_at.split('T')[0]}</td>
                                        <td className="p-4 border-t border-slate-200">{loan.due_date}</td>
                                        <td className="p-4 border-t border-slate-200">{loan.is_returned}</td>
                                    </tr>
                                ))) : (<tr>

                                    <td colSpan="6" className="p-4 border-t border-slate-200 text-center">No loan issued yet</td>
                                </tr>
                                )}
                        </tbody>
                    </table>
                </div>)

            }
        </>

    )
}

export default Loans
