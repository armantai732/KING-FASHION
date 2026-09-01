import React, { useEffect, useState } from "react";
import { deleteProduct, getAllProduct, updateProductStatus } from "../data/api.js";
import { useNavigate } from "react-router-dom";
import { EllipsisVertical } from "lucide-react";
import { toast } from "react-toastify";

function GetProduct() {
    const [products, setProducts] = useState([]);
    const [openId, setOpenId] = useState(null);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await getAllProduct();
            setProducts(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const changeStatus = async (id, status) => {
        try {
            await updateProductStatus(id, status);

            setProducts((prev) =>
                prev.map((item) => (item._id === id ? { ...item, status } : item))
            );

            setOpenId(null);
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleDelete = async (id) => {
        const res = await deleteProduct(id);

        if (res.status) {
            toast.success("Product Deleted");
            fetchProducts();
        }
    };

    const getImageUrl = (item) =>
        item.image && item.image[0]
            ? item.image[0].startsWith("http")
                ? item.image[0]
                : `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/uploads/${item.image[0].replace(/^uploads[\\/]/, "")}`
            : "";

    const filteredProducts = products.filter(
        (item) =>
            item.name.toLowerCase().startsWith(search.toLowerCase()) ||
            item.category.toLowerCase().startsWith(search.toLowerCase())
    );

    const StatusMenu = ({ item, className = "" }) => (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setOpenId(openId === item._id ? null : item._id)}
                className="mx-auto flex items-center justify-center gap-1.5 max-[400px]:gap-1 rounded-lg border px-3 py-2 max-[400px]:px-2 max-[400px]:py-1.5 hover:bg-gray-100 transition"
            >
                <span
                    className={`text-sm max-[400px]:text-xs font-medium ${item.status === "Available" ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {item.status}
                </span>
                <EllipsisVertical className="h-[18px] w-[18px] max-[400px]:h-4 max-[400px]:w-4" />
            </button>

            {openId === item._id && (
                <div className="absolute right-0 top-full z-50 mt-1 w-40 max-[400px]:w-36 overflow-hidden rounded-lg border bg-white shadow-xl">
                    <button
                        onClick={() => changeStatus(item._id, "Available")}
                        className="block w-full px-4 py-2.5 max-[400px]:px-3 max-[400px]:py-2 text-left text-sm max-[400px]:text-xs hover:bg-green-50 transition"
                    >
                        ✅ Available
                    </button>
                    <button
                        onClick={() => changeStatus(item._id, "Unavailable")}
                        className="block w-full px-4 py-2.5 max-[400px]:px-3 max-[400px]:py-2 text-left text-sm max-[400px]:text-xs hover:bg-red-50 transition"
                    >
                        ❌ Unavailable
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full p-3 sm:p-0">
            <h1 className="mb-2 text-xl max-[400px]:text-lg font-bold sm:text-3xl">
                All Products
            </h1>

            <input
                type="text"
                placeholder="Search by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 max-[400px]:px-2.5 max-[400px]:py-1.5 text-sm max-[400px]:text-xs outline-none focus:ring-2 focus:ring-blue-500 sm:mb-0 sm:w-80 sm:px-4"
            />

            {/* Mobile: card list */}
            <div className="flex flex-col gap-2.5 max-[400px]:gap-2 sm:hidden h-[73.5vh] overflow-scroll">
                {filteredProducts.map((item) => (
                    <div
                        key={item._id}
                        className="flex gap-3 max-[400px]:gap-2 rounded-xl border border-gray-200 bg-white p-3 max-[400px]:p-2 shadow-sm"
                    >
                        <img
                            src={getImageUrl(item)}
                            alt={item.name}
                            className="h-14 w-14 max-[400px]:h-12 max-[400px]:w-12 shrink-0 rounded-lg border object-cover"
                        />

                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <div className="flex items-start justify-between gap-2">
                                <p className="truncate text-sm max-[400px]:text-xs font-semibold">
                                    {item.name}
                                </p>
                                <StatusMenu item={item} />
                            </div>
                            <p className="text-xs max-[400px]:text-[11px] text-gray-500">
                                {item.category}
                            </p>
                            <p className="text-sm max-[400px]:text-xs font-semibold text-green-600">
                                ₹{item.price}
                            </p>

                            <div className="mt-1.5 flex gap-2 max-[400px]:gap-1.5">
                                <button
                                    onClick={() => navigate(`/admin/product/update/${item._id}`)}
                                    className="flex-1 rounded-lg bg-yellow-500 px-2.5 py-1.5 max-[400px]:px-2 max-[400px]:py-1 text-xs max-[400px]:text-[11px] font-medium text-white hover:bg-yellow-600 transition"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => {
                                        const ok = window.confirm(
                                            "Are you sure you want to delete this product?"
                                        );
                                        if (ok) handleDelete(item._id);
                                    }}
                                    className="flex-1 rounded-lg bg-red-600 px-2.5 py-1.5 max-[400px]:px-2 max-[400px]:py-1 text-xs max-[400px]:text-[11px] font-medium text-white hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredProducts.length === 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white py-8 text-center text-sm text-gray-500 shadow-sm">
                        No Products Found
                    </div>
                )}
            </div>

            {/* Desktop / tablet: table */}
            <div className="hidden h-[75vh] overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg sm:block">
                <table className="w-full min-w-[900px]">
                    <thead className="bg-slate-900 text-white">
                        <tr>
                            <th className="whitespace-nowrap px-4 py-4 text-left">Image</th>
                            <th className="whitespace-nowrap px-4 py-4 text-left">Name</th>
                            <th className="whitespace-nowrap px-4 py-4 text-left">Category</th>
                            <th className="whitespace-nowrap px-4 py-4 text-left">Price</th>
                            <th className="whitespace-nowrap px-4 py-4 text-center">Update</th>
                            <th className="whitespace-nowrap px-4 py-4 text-center">Delete</th>
                            <th className="whitespace-nowrap px-4 py-4 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredProducts.map((item) => (
                            <tr
                                key={item._id}
                                className="border-b border-gray-200 transition duration-200 hover:bg-slate-50"
                            >
                                <td className="px-4 py-4">
                                    <img
                                        src={getImageUrl(item)}
                                        alt={item.name}
                                        className="h-14 w-14 rounded-lg border object-cover md:h-16 md:w-16"
                                    />
                                </td>

                                <td className="whitespace-nowrap px-4 py-4 font-semibold">
                                    {item.name}
                                </td>

                                <td className="whitespace-nowrap px-4 py-4">{item.category}</td>

                                <td className="whitespace-nowrap px-4 py-4 font-semibold text-green-600">
                                    ₹{item.price}
                                </td>

                                <td className="px-4 py-4 text-center">
                                    <button
                                        onClick={() => navigate(`/admin/product/update/${item._id}`)}
                                        className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-600"
                                    >
                                        Update
                                    </button>
                                </td>

                                <td className="px-4 py-4 text-center">
                                    <button
                                        onClick={() => {
                                            const ok = window.confirm(
                                                "Are you sure you want to delete this product?"
                                            );
                                            if (ok) handleDelete(item._id);
                                        }}
                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>

                                <td className="relative px-4 py-4 text-center">
                                    <StatusMenu item={item} className="inline-block" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredProducts.length === 0 && (
                    <div className="py-10 text-center text-lg text-gray-500">
                        No Products Found
                    </div>
                )}
            </div>
        </div>
    );
}

export default GetProduct;