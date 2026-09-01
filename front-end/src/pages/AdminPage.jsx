import React from "react";
import { Outlet } from "react-router-dom";
import NavLink from "../components/NavLink";

function AdminPage() {
  return (
    <div className="md:flex block min-h-screen ">
      {/* Sidebar */}
      <NavLink />

      {/* Right Content */}
      <div className="flex-1 bg-gray-100 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminPage;