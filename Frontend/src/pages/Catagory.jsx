
import { useState, useEffect } from "react"
function Catagory() {

    const [message, setMessage] = useState('')
    const [editCatagory, setEditCatagory] = useState(false)
    const [addCatagory, setAddCatagory] = useState(false)
    const [data, setData] = useState({
        c_id: '',
        c_name: '',
        c_description: '',
        created_at: ''
    })
    const [editdata, setEditData] = useState({
        c_id: '',
        c_name: '',
        c_description: '',
        created_at: ''
    })

    const [loading, setLoading] = useState(true)
    const [catagory, setCatagory] = useState([])
    useEffect(() => {
        async function catagory__() {
            try {
                const response = await fetch('http://127.0.0.1:8000/catagory/get')
                const result = await response.json()
                setCatagory(result)
                setLoading(false)
            } 
            catch (error) {
                console.log(error);
            }
            finally{
                setLoading(false)
            }
        }
        catagory__()
        console.log(catagory);
    }, [editCatagory,addCatagory])

    async function handleEdit(e) {
        e.preventDefault()
        try {
            const token = sessionStorage.getItem("access_token");

            const response = await fetch("http://127.0.0.1:8000/catagory/update", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(editdata)
            })
            const result = await response.json()
            if (response.ok) {
                setEditData({
                    c_id: '',
                    c_name: '',
                    c_description: '',
                    created_at: ''
                });
                setEditCatagory(false);
                setTimeout(() => {
                    setMessage('')
                }, 3000)
                setMessage(result.message);
            }
            else {
                setMessage(result.details)
            }
        }
        catch (error) {
            console.log(error);

        }
    }

    async function handleAdd(e) {
        e.preventDefault();           
        try {
            if (data.c_name === '') {
                setMessage("Enter a name!")
                return
            }
            const token = sessionStorage.getItem("access_token");
            const response = await fetch("http://127.0.0.1:8000/catagory/add", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })
            const result = await response.json()
            if(response.ok){
                setTimeout(()=>{
                    setMessage('')
                },3000)
                setAddCatagory(false);
                setData({
                    c_id: '',
                    c_name: '',
                    c_description: '',
                    created_at: ''
                });
                setMessage(result.message)
            }
            else{
                setMessage(result.details)
            }
        } catch (error) {
            console.log(error);

        }
    }

    const [search, setSearch] = useState('')
    const filterCatagory = catagory.filter((cat) => cat['c_name'].toLowerCase().includes(search.toLowerCase()))

    return (
        <>
            {loading ? (<p>Loading items...</p>) : (<p>Total Catagories = {catagory.length}</p>)}

            <div className="bg-white rounded-xl shadow overflow-x-auto mt-6 w-auto max-h-100 overflow-y-auto">

                <div className="flex justify-between gap-3 p-2 w-auto sticky top-0 z-50 bg-amber-200">
                    <h1 className="text-2xl md:text-3xl text-center ml-5 p-2 font-bold text-amber-800">Catagories</h1>


                    <input
                        onChange={(e) => { setSearch(e.target.value) }}
                        type="text"
                        placeholder="Search Catagory..."
                        className="border border-slate-300 rounded-lg p-3 w-2/5 bg-white"
                    />

                </div>
                <table className="w-auto md:w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="w-auto p-4">Id</th>
                            <th className="w-auto p-4">Catagory</th>
                            <th className="w-auto p-4">Description</th>
                            <th className="w-auto p-4">Creation Time</th>
                            <th className="w-auto p-4">Update Time</th>
                            <th className="w-auto p-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterCatagory.length > 0 ? (

                            filterCatagory.map((cat) => (
                                <tr key={cat['c_id']}>
                                    <td className="p-4 border-t border-slate-200">{cat['c_id']}</td>
                                    <td className="p-4 border-t border-slate-200">{cat['c_name']}</td>
                                    <td className="p-4 border-t border-slate-200">{cat['c_description'] ? (cat['c_description']) : ('None')}</td>
                                    <td className="p-4 border-t border-slate-200">{cat['created_at'].split('T')[0]}</td>
                                    <td className="p-4 border-t border-slate-200">{cat['updated_at']?(cat['updated_at'].split('T')[1]):("N/A")}</td>
                                    <td className="p-4 border-t border-slate-200">
                                        <button
                                            className="pl-5 pr-5 bg-amber-200 cursor-pointer"
                                            onClick={() => {
                                                setEditData({
                                                    c_id: cat.c_id,
                                                    c_name: cat.c_name,
                                                    c_description: cat.c_description || '',
                                                    created_at: cat.created_at
                                                });
                                                setEditCatagory(true);
                                                setAddCatagory(false);
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )
                            :
                            (
                                <tr>
                                    <td colSpan="7" className="text-center p-6 text-slate-500">
                                        No category found.
                                    </td>
                                </tr>
                            )
                        }


                    </tbody>
                </table>
            </div>
            <p className="text-red-700 p-2 text-center">{message}</p>
            {/* <button onClick={handleAdd} className="m-10 p-2 bg-amber-600 border-2 cursor-pointer">Add Catagory</button> */}

            {editCatagory && (
                <form
                    className="mt-10 border-2 p-4"
                    onSubmit={handleEdit}
                >
                    <h2 className="text-xl font-bold mb-3">Edit Catagory</h2>
                    <label htmlFor="name">Name: </label>
                    <input
                        id="name"
                        className="p-2 m-1 border-2"
                        type="text"
                        value={editdata.c_name}
                        onChange={(e) =>
                            setEditData({ ...editdata, c_name: e.target.value })
                        }
                        placeholder="Enter Name"
                    />
                    <input
                        id="description"
                        className="p-2 m-1 border-2"
                        type="text"
                        value={editdata.c_description}
                        onChange={(e) =>
                            setEditData({ ...editdata, c_description: e.target.value })
                        }
                        placeholder="Enter Description"
                    />


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
                            onClick={() => setEditCatagory(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>

            )}


            {(!editCatagory && addCatagory) ?
                (
                    <form className=" flex items-center flex-wrap mt-10 border-2" onSubmit={handleAdd}>
                        <input
                            className="p-1 m-1 border-2"
                            type="text"
                            placeholder="Catagory Name"
                            value={data.c_name}
                            onChange={(e) => setData({ ...data, c_name: e.target.value })} />


                        <input
                            className="p-1 m-1 border-2"
                            type="text"
                            placeholder="Description"
                            value={data.c_description}
                            onChange={(e) => setData({ ...data, c_description: e.target.value })}
                        />

                        <button className="text-center bg-amber-600 p-1 m-1 pl-5 pr-5 border-2 cursor-pointer" type="submit">
                            Add
                        </button>
                        <button className="text-center bg-slate-300 p-1 m-1 pl-5 pr-5 border-2 cursor-pointer" type="button" onClick={() => {
                            setAddCatagory(false)
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
                    <div className="m-10">
                        {/* <p className="mt-3 text-center text-amber-700">
                            {message}
                        </p> */}

                        <button
                            className="pl-5 pr-5 text-center bg-amber-600 p-1 border-2 cursor-pointer"
                            onClick={() => setAddCatagory(true)}
                        >
                            Add Catagory
                        </button>
                    </div>
                )
            }
        </>
    )
}

export default Catagory