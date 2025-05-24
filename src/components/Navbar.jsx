"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            Bajaj Rent System
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span>Welcome, {user.name}</span>
                {user.role === "admin" ? (
                  <Link to="/admin" className="hover:text-blue-200">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link to="/dashboard" className="hover:text-blue-200">
                    My Dashboard
                  </Link>
                )}
                <button onClick={logout} className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">
                  Login
                </Link>
                <Link to="/register" className="hover:text-blue-200">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
