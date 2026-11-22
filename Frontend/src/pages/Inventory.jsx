import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";

function Inventory() {
    const user = JSON.parse(sessionStorage.getItem("user") || "null");
    const isAdmin = user?.role === 'admin' || user?.role === 'staff';
    const student = user?.role === "student";
    const navigate = useNavigate()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('')
    const [additem, setAddItem] = useState(false);
    const [message, setMessage] = useState("");
    const [data, setData] = useState({
        catagory: "",
        item_name: "",
        item_description: "",
        item_condition: "good",
    });

    const [editItem, setEditItem] = useState(false);
    const [editData, setEditData] = useState({
        item_id: '',
        catagory: '',
        item_name: '',
        item_description: "",
        item_condition: '',
        availability: ''
    });
    const [catagory, setCatagory] = useState([])
    useEffect(() => {
        async function catagory__() {
            try {
                const response = await fetch('http://127.0.0.1:8000/catagory/get')
                const result = await response.json()
                setCatagory(result)
            } catch (error) {
                console.log(error);
            }
        }
        catagory__()
    }, [])

    async function fetchItems() {
        try {
            const response = await fetch("http://127.0.0.1:8000/dashboard/inventory");
            const result = await response.json();
            setItems(result);
        }
        catch (error) {
            console.error("Error fetching inventory:", error);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchItems();
    }, []);

    async function new_item() {
        try {
            const token = sessionStorage.getItem("access_token");
            if (!token) {
                navigate("/login", { replace: true });
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/inventory/add_item', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })
            const result = await response.json()
            if (response.status === 401) {
                localStorage.removeItem("access_token");
                sessionStorage.removeItem('user')
                navigate("/login", {
                    replace: true,
                    state: { message: "Your session has expired. Please log in again." }
                });
                return;
            }
            // Authenticated but restricted
            if (response.status === 403) {
                setMessage("Access denied. Only administrators can add items.");
                return;
            }
            if (!response.ok) {
                setMessage(result.detail || "Unable to add item.");
                return;
            }
            setData({
                catagory: "",
                item_name: "",
                item_condition: "",
                item_description: "",
            });
            return true;

        } catch (error) {
            console.error("Error adding item:", error);
            setMessage("Unable to connect to the server.");
        }
    }

    async function handleEdit(e) {
        e.preventDefault()
        try {
            if (!editData.catagory) {
                setMessage("Please select a catagory")
                return
            }
            const token = sessionStorage.getItem("access_token");

            const response = await fetch(`http://127.0.0.1:8000/item/update`,
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(editData)

                }
            )
            const result = await response.json()
            if (response.status === 403) {
                setMessage("Access denied. Only administrators can add items.");
                return;
            }
            if (!response.ok) {
                setMessage(result.detail || "Unable to update.");
                return;
            }
            setEditData({
                item_id: '',
                catagory: '',
                item_name: '',
                item_description: "",
                item_condition: '',
                availability: ''
            });
            setEditItem(false);
            setTimeout(() => {
                setMessage('')
            }, 3000)
            setMessage("Item updated successfully!");
            fetchItems()
        }
        catch (error) {
            console.error("Error adding user:", error);
            setMessage("Unable to connect to the server.");
        }
    }

    async function create_request(item_id) {
        try {

            const token = sessionStorage.getItem("access_token");
            const response = await fetch('http://127.0.0.1:8000/requests/create', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    item_id: item_id
                })
            })
            const result = await response.json()

            if (response.ok) {
                setMessage(result.message)
                // return
            }
            if (!result["success"]) {
                setMessage(result.details)
            }

        } catch (error) {
            console.log(error);
        }
    }


    const [filterBy, setFilterBy] = useState('item_name')
    const filter_items = items.filter((item) => item[filterBy].toLowerCase().includes(search.toLowerCase()))
    // const user = JSON.parse(sessionStorage.getItem("user"));
    // const role = user['role']

    return (
        <div>
            {loading ? (<p>Loading items...</p>) : (<p>Total Items = {items.length}</p>)}

            <div className="bg-white rounded-xl shadow overflow-x-auto mt-6 w-auto h-100 overflow-y-auto">

                <div className="flex justify-between gap-3 p-2 w-auto sticky top-0 z-50 bg-amber-200">
                    <h1 className="text-2xl md:text-3xl text-center ml-5 p-2 font-bold text-amber-800">Inventory</h1>
                    <div className='flex justify-center items-center'>
                        <p className="text-amber-700 font-bold text-sm md:text-lg w-auto m-2">Filter by:</p>
                        <div className="flex flex-col items-center m-1 text-sm md:text-md w-auto">
                            <input
                                type="radio"
                                id="item_name"
                                name="filter"
                                value="item_name"
                                checked={filterBy === 'item_name'}
                                onChange={(e) => setFilterBy(e.target.value)}
                            />
                            <label className="text-center" htmlFor="item_name">Item name</label>
                        </div>
                        <div className="flex flex-col items-center m-1 text-sm md:text-md w-auto">
                            <input
                                type="radio"
                                id="condition"
                                name="filter"
                                value='item_condition'
                                checked={filterBy === 'item_condition'}
                                onChange={(e) => setFilterBy(e.target.value)}
                            />
                            <label htmlFor="condition">Condition</label>
                        </div>
                        <div className="flex flex-col items-center m-1 text-sm md:text-md w-auto">
                            <input
                                type="radio"
                                id="availability"
                                name="filter"
                                value="availability"
                                checked={filterBy === 'availability'}
                                onChange={(e) => setFilterBy(e.target.value)}
                            />
                            <label htmlFor="availability">Availability</label>
                        </div>
                        <input
                            onChange={(e) => { setSearch(e.target.value) }}
                            type="text"
                            placeholder="Search Item..."
                            className="border border-slate-300 rounded-lg p-3 w-2/5 bg-white"
                        />
                    </div>
                </div>
                <table className="w-auto md:w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="w-auto p-4 ">Item ID</th>
                            <th className="w-auto p-4 ">Item Name</th>
                            <th className="w-auto p-4 ">Catagory</th>
                            <th className="w-auto p-4 ">Condition</th>
                            <th className="w-auto p-4 ">Availability</th>
                            <th className="w-auto p-4 ">Description</th>
                            <th className="w-auto p-4 "></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filter_items.length > 0 ? (
                            filter_items.map((item) => (
                                <tr key={item.item_id}>
                                    <td className="p-4 border-t border-slate-200">{item.item_id}</td>
                                    <td className="p-4 border-t border-slate-200">{item.item_name}</td>
                                    <td className="p-4 border-t border-slate-200">{item.c_name}</td>
                                    <td className="p-4 border-t border-slate-200">{item.item_condition}</td>
                                    <td className="p-4 border-t border-slate-200">{item.availability}</td>
                                    <td className="p-4 border-t border-slate-200">{item.item_description ? item.item_description : 'None'}</td>
                                    {isAdmin && (<td className="p-4 border-t border-slate-200">
                                        <button
                                            className="pl-5 pr-5 bg-amber-200 cursor-pointer"
                                            onClick={() => {
                                                setEditData({
                                                    item_id: item.item_id,
                                                    catagory: item.c_id ?? '',
                                                    item_name: item.item_name,
                                                    item_description: item.item_description || "",
                                                    item_condition: item.item_condition,
                                                    availability: item.availability
                                                });

                                                setEditItem(true);
                                                setAddItem(false);
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </td>)}
                                    {student && (<td className="p-4 border-t border-slate-200">
                                        {item.availability === 'available' ? (<button type="submit"
                                            className="pl-5 pr-5 bg-amber-200 cursor-pointer"
                                            onClick={() => {
                                                create_request(item.item_id)
                                            }}
                                        >
                                            Request
                                        </button>) : (<p className="text-red-700">Not available</p>)}
                                    </td>)}
                                </tr>
                            ))
                        ) : (<tr>
                            <td colSpan="7" className="text-center p-6 text-slate-500">
                                No items found.
                            </td>
                        </tr>)
                        }
                    </tbody>
                </table>
            </div>
                {student && (<p className="mt-3 text-center text-amber-700">
                    {message}
                </p>
                )}

            {isAdmin && editItem && (
                <form
                    className="mt-10 border-2 p-4"
                    onSubmit={handleEdit}
                >
                    <h2 className="text-xl font-bold mb-3">Edit Item</h2>
                    <label htmlFor="name">Name: </label>
                    <input
                        id="name"
                        className="p-2 m-1 border-2"
                        type="text"
                        value={editData.item_name}
                        onChange={(e) =>
                            setEditData({ ...editData, item_name: e.target.value })
                        }
                        placeholder="Enter Name"
                    />
                    <label htmlFor="catagory">Catagory :
                    </label>
                    <select
                        id="catagory"
                        className="p-1 m-1 border-2"
                        value={editData.catagory}
                        onChange={(e) => setEditData({ ...editData, catagory: e.target.value })}
                    >
                        <option value="">Select Category</option>
                        {catagory.map((cat) => (
                            <option key={cat['c_id']} value={cat['c_id']}>{cat['c_name']}</option>
                        ))}
                    </select>
                    <label htmlFor="item_condition">Condition: </label>
                    <select
                        id="item_condition"
                        className="p-2 m-1 border-2"
                        value={editData.item_condition}
                        onChange={(e) =>
                            setEditData({ ...editData, item_condition: e.target.value })
                        }
                    >
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="damaged">Damaged</option>
                    </select>
                    <label htmlFor="availablilty">Availablilty: </label>
                    <select
                        id="availablilty"
                        className="p-2 m-1 border-2"
                        value={editData.availability}
                        onChange={(e) =>
                            setEditData({ ...editData, availability: e.target.value })
                        }
                    >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="borrowed">Borrowed</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="retired">Retired</option>
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
                            onClick={() => setEditItem(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>

            )}

            {(!editItem && isAdmin && additem) ?
                (
                    <form className=" flex items-center flex-wrap mt-10 border-2" onSubmit={async (e) => {
                        e.preventDefault();
                        if (data.item_name === '') {
                            setMessage("Enter a name!")
                            return
                        }
                        const success = await new_item();
                        if (success) {
                            setAddItem(false);
                            setData({
                                catagory: "",
                                item_name: "",
                                item_condition: "",
                                item_description: "",
                            });
                            setTimeout(() => {
                                setMessage('')
                            }, 3000)
                            setMessage('Added successfully!')
                            fetchItems()
                        }
                    }}>
                        <input
                            className="p-1 m-1 border-2"
                            type="text"
                            placeholder="Item Name"
                            value={data.item_name}
                            onChange={(e) => setData({ ...data, item_name: e.target.value })} />
                        <span className="ml-3 flex items-center">
                            <label htmlFor="catagory">Catagory :
                            </label>
                            <select
                                id="catagory"
                                className="p-1 m-1 border-2"
                                value={data.catagory}
                                onChange={(e) => setData({ ...data, catagory: e.target.value })}
                            >
                                {catagory.map((cat) => (
                                    <option key={cat['c_id']} value={cat['c_id']}>{cat['c_name']}</option>
                                ))}
                            </select>
                        </span>
                        <span className="ml-3 flex items-center">
                            <label htmlFor="condition">Condition :
                            </label>
                            <select
                                id="condition"
                                className="p-1 m-1 border-2"
                                value={data.item_condition}
                                onChange={(e) => setData({ ...data, item_condition: e.target.value })}
                            >
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="damaged">Damaged</option>
                            </select>
                        </span>

                        <input
                            className="p-1 m-1 border-2"
                            type="text"
                            placeholder="Description"
                            value={data.item_description}
                            onChange={(e) => setData({ ...data, item_description: e.target.value })}
                        />

                        <button className="text-center bg-amber-600 p-1 m-1 pl-5 pr-5 border-2 cursor-pointer" type="submit">
                            Add
                        </button>
                        <button className="text-center bg-slate-300 p-1 m-1 pl-5 pr-5 border-2 cursor-pointer" type="button" onClick={() => {
                            setAddItem(false)
                            setMessage('')
                        }}>
                            Cancel
                        </button>
                        <p className="ml-10 text-center text-amber-700">
                            {message}
                        </p>
                    </form>
                )

                : (
                    (isAdmin && (
                        <div className="m-10">
                            <p className="mt-3 text-center text-amber-700">
                                {message}
                            </p>

                            <button
                                className="pl-5 pr-5 text-center bg-amber-600 p-1 border-2 cursor-pointer"
                                onClick={() => setAddItem(true)}
                            >
                                Add Item
                            </button>
                        </div>
                    ))
                )
            }
        </div>
    )
}

export default Inventory
