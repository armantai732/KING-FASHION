import React from "react";
import { useNavigate } from "react-router-dom";
import { LogoutUser } from "../data/api";
import { toast } from "react-toastify";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await LogoutUser();
      toast.success("Logout Successfully");
      navigate("/Login");
      localStorage.clear("token")
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">👋</div>

        <h1 className="text-3xl font-bold text-gray-800">
          Logout
        </h1>

        <p className="text-gray-600 mt-3">
          Are you sure you want to logout from your account?
        </p>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate(-1)}
            className="w-1/2 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleLogout}
            className="w-1/2 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Logout;