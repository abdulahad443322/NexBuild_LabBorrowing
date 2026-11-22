import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);
function Reports() {
    const [loanHistory, setLoanHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const totalLoans = loanHistory.length;
    const activeLoans = loanHistory.filter(
        (loan) => !loan.is_returned
    ).length;
    const returnedLoans = loanHistory.filter(
        (loan) => loan.is_returned
    ).length;
    const overdueLoans = loanHistory.filter(
        loan =>
            !loan.is_returned &&
            new Date(loan.due_date) < new Date(new Date().toDateString())
    ).length;

    useEffect(() => {
        async function fetchLoanHistory() {
            const token = sessionStorage.getItem("access_token");
            try {
                const response = await fetch("http://127.0.0.1:8000/reports/loan-history",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                const result = await response.json();
                if (response.ok) {
                    setLoanHistory(result);
                }
                else {
                    setMessage(result.detail || "Failed to fetch loan history");
                }
            }
            catch (error) {
                console.error(error);
                setMessage("Server connection failed");
            } finally {
                setLoading(false);
            }

        }
        fetchLoanHistory();
    }, []);



    const chartData = {
        labels: ["Active", "Returned", "Overdue"],

        datasets: [
            {
                data: [
                    activeLoans,
                    returnedLoans,
                    overdueLoans
                ],

                backgroundColor: [
                    "oklch(52.7% 0.154 150.069)",
                    "oklch(74.6% 0.16 232.661)",
                    "oklch(70.4% 0.04 256.788)"
                ],

                borderWidth: 1,
                borderColor: "#ffffff"
            }
        ]
    };
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">
                Reports Dashboard
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-amber-800 text-white p-5 rounded-xl">
                    <h2 className="text-sm">Total Loans</h2>
                    <p className="text-3xl font-bold">{totalLoans}</p>
                </div>
                <div className="bg-green-700 text-white p-5 rounded-xl">
                    <h2 className="text-sm">Active Loans</h2>
                    <p className="text-3xl font-bold">{activeLoans}</p>
                </div>
                <div className="bg-sky-400 text-white p-5 rounded-xl">
                    <h2 className="text-sm">Returned Loans</h2>
                    <p className="text-3xl font-bold">{returnedLoans}</p>
                </div>
                <div className="bg-slate-400 text-white p-5 rounded-xl">
                    <h2 className="text-sm">Overdue Loans</h2>
                    <p className="text-3xl font-bold">{overdueLoans}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
                <h2 className="text-xl font-semibold mb-4">
                    Loan Status Distribution
                </h2>

                <div className="w-full max-w-sm h-80 mx-auto">
                    <Pie
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: "bottom"
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default Reports;