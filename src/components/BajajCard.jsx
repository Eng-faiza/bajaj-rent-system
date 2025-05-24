"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const BajajCard = ({ bajaj, onEdit, onDelete, showActions = false }) => {
  const { user } = useAuth()

  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <div className="relative overflow-hidden">
        <img
          src={
            bajaj.image?.startsWith("/uploads")
              ? `http://localhost:5000${bajaj.image}`
              : bajaj.image || "/placeholder.svg?height=250&width=400"
          }
          alt={bajaj.model}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              bajaj.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {bajaj.isAvailable ? "Available" : "Booked"}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{bajaj.model}</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">${bajaj.pricePerDay}</div>
            <div className="text-sm text-gray-500">per day</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span className="text-sm">{bajaj.registrationNumber}</span>
          </div>

          {bajaj.description && <p className="text-gray-600 text-sm line-clamp-2">{bajaj.description}</p>}
        </div>

        <div className="flex gap-2">
          {showActions ? (
            <>
              <button
                onClick={() => onEdit(bajaj)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(bajaj._id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              {user ? (
                <Link
                  to={`/book/${bajaj._id}`}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 text-center"
                >
                  Book Now
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                >
                  Login to Book
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default BajajCard
