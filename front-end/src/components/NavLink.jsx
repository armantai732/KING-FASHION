import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    ListOrdered,
    ShoppingCart,
    Clock,
    Truck,
    CheckCircle2,
    Users,
    UserX,
    Settings,
    LogOut,
    ChevronDown,
    Menu,
    X,
} from "lucide-react";

function NavLink() {
    const [productOpen, setProductOpen] = useState(false);
    const [orderOpen, setOrderOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const linkClass = (path) =>
        `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            isActive(path)
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`;

    const subLinkClass = (path) =>
        `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
            isActive(path)
                ? "bg-blue-600/90 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`;

    const sectionButtonClass =
        "flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white";

    const closeMobile = () => setMobileOpen(false);

    const SidebarContent = (
        <>
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-xl font-bold tracking-tight text-white">
                    Admin Panel
                </h1>
                <button
                    onClick={closeMobile}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
                >
                    <X size={22} />
                </button>
            </div>

            <ul className="space-y-1.5">
                <li>
                    <Link to="/admin" onClick={closeMobile} className={linkClass("/admin")}>
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>
                </li>

                {/* Products */}
                <li>
                    <button
                        onClick={() => setProductOpen(!productOpen)}
                        className={sectionButtonClass}
                    >
                        <span className="flex items-center gap-3">
                            <Package size={18} />
                            Products
                        </span>
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${
                                productOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    <div
                        className={`overflow-hidden transition-all duration-200 ${
                            productOpen ? "mt-1 max-h-40" : "max-h-0"
                        }`}
                    >
                        <ul className="ml-4 space-y-1 border-l border-slate-700 pl-3">
                            <li>
                                <Link
                                    to="/admin/product/add"
                                    onClick={closeMobile}
                                    className={subLinkClass("/admin/product/add")}
                                >
                                    <PlusCircle size={15} />
                                    Add Product
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/admin/product/get"
                                    onClick={closeMobile}
                                    className={subLinkClass("/admin/product/get")}
                                >
                                    <ListOrdered size={15} />
                                    Get Products
                                </Link>
                            </li>
                        </ul>
                    </div>
                </li>

                {/* Orders */}
                <li>
                    <button
                        onClick={() => setOrderOpen(!orderOpen)}
                        className={sectionButtonClass}
                    >
                        <span className="flex items-center gap-3">
                            <ShoppingCart size={18} />
                            Orders
                        </span>
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${
                                orderOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    <div
                        className={`overflow-hidden transition-all duration-200 ${
                            orderOpen ? "mt-1 max-h-60" : "max-h-0"
                        }`}
                    >
                        <ul className="ml-4 space-y-1 border-l border-slate-700 pl-3">
                            <li>
                                <Link
                                    to="/admin/orders"
                                    onClick={closeMobile}
                                    className={subLinkClass("/admin/orders")}
                                >
                                    <ListOrdered size={15} />
                                    All Orders
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/admin/orders/pending"
                                    onClick={closeMobile}
                                    className={subLinkClass("/admin/orders/pending")}
                                >
                                    <Clock size={15} />
                                    Processing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/admin/orders/shipped"
                                    onClick={closeMobile}
                                    className={subLinkClass("/admin/orders/shipped")}
                                >
                                    <Truck size={15} />
                                    Shipped
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/admin/orders/delivered"
                                    onClick={closeMobile}
                                    className={subLinkClass("/admin/orders/delivered")}
                                >
                                    <CheckCircle2 size={15} />
                                    Delivered
                                </Link>
                            </li>
                        </ul>
                    </div>
                </li>

                {/* Users */}
                {/* <li>
                    <button
                        onClick={() => setUserOpen(!userOpen)}
                        className={sectionButtonClass}
                    >
                        <span className="flex items-center gap-3">
                            <Users size={18} />
                            Users
                        </span>
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${
                                userOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    <div
                        className={`overflow-hidden transition-all duration-200 ${
                            userOpen ? "mt-1 max-h-40" : "max-h-0"
                        }`}
                    >
                        <ul className="ml-4 space-y-1 border-l border-slate-700 pl-3">
                            <li>
                                <Link
                                    to="/admin/users"
                                    onClick={closeMobile}
                                    className={subLinkClass("/admin/users")}
                                >
                                    <ListOrdered size={15} />
                                    All Users
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/admin/users/block"
                                    onClick={closeMobile}
                                    className={subLinkClass("/admin/users/block")}
                                >
                                    <UserX size={15} />
                                    Block User
                                </Link>
                            </li>
                        </ul>
                    </div>
                </li> */}

                {/* <li className="pt-2">
                    <Link
                        to="/admin/settings"
                        onClick={closeMobile}
                        className={linkClass("/admin/settings")}
                    >
                        <Settings size={18} />
                        Settings
                    </Link>
                </li> */}

                <li>
                    <Link
                        to="/logout"
                        onClick={closeMobile}
                        className="flex items-center gap-3 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                    >
                        <LogOut size={18} />
                        Logout
                    </Link>
                </li>
            </ul>
        </>
    );

    return (
        <>
            {/* Mobile top bar */}
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white md:hidden">
                <h1 className="text-lg font-bold">Admin Panel</h1>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="rounded-md p-1.5 hover:bg-slate-800"
                >
                    <Menu size={22} />
                </button>
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    onClick={closeMobile}
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                />
            )}

            {/* Mobile drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 transform overflow-y-auto bg-slate-900 p-5 text-white transition-transform duration-300 ease-in-out md:hidden ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {SidebarContent}
            </aside>

            {/* Desktop sidebar */}
            <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto bg-slate-900 p-5 text-white md:block">
                {SidebarContent}
            </aside>
        </>
    );
}

export default NavLink;