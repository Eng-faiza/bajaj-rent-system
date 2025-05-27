"use client"

import { useState, useEffect } from "react"
import Modal from "../components/ui/Modal"
import ImageUpload from "../components/ui/ImageUpload"
import BajajCard from "../components/BajajCard"
import LoadingSpinner from "../components/LoadingSpinner"

const AdminDashboard = () => {
  const [bajajs, setBajajs] = useState([])
  const [bookings, setBookings] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBajaj, setEditingBajaj] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [formData, setFormData] = useState({
    model: "",
    registrationNumber: "",
    pricePerDay: "",
    description: "",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchBajajs = async () => {
    try {
      console.log("Fetching vehicles for admin dashboard...")
      const response = await fetch("https://bajaj-rent-system-backend.onrender.com/api/bajaj", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error:", errorText)
        throw new Error(`Failed to fetch vehicles: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("Received data:", data)

      if (Array.isArray(data)) {
        setBajajs(data)
        console.log("Successfully set vehicles:", data.length)
      } else {
        console.error("Expected array but got:", typeof data, data)
        setBajajs([])
        throw new Error("Invalid data format received from server")
      }
    } catch (error) {
      console.error("Error fetching Bajajs:", error)
      setBajajs([])
      throw error
    }
  }

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("https://bajaj-rent-system-backend.onrender.com/api/booking/all", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.href = "/login"
          return
        }
        throw new Error(`Failed to fetch bookings: ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setBookings(data)
      } else {
        console.error("Expected array but got:", typeof data, data)
        setBookings([])
        throw new Error("Invalid booking data format received from server")
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setBookings([])
      throw error
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try to fetch vehicles first
      try {
        await fetchBajajs()
      } catch (bajajError) {
        console.error("Failed to fetch vehicles:", bajajError)
        setError("Failed to fetch vehicles. Please check if the server is running.")
      }

      // Try to fetch bookings
      try {
        await fetchBookings()
      } catch (bookingError) {
        console.error("Failed to fetch bookings:", bookingError)
        // Don't set error for bookings if vehicles worked
        if (!error) {
          setError("Failed to fetch bookings. Vehicle data loaded successfully.")
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      model: "",
      registrationNumber: "",
      pricePerDay: "",
      description: "",
    })
    setSelectedImage(null)
    setEditingBajaj(null)
  }

  const handleAddBajaj = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const formDataToSend = new FormData()
      formDataToSend.append("model", formData.model.trim())
      formDataToSend.append("registrationNumber", formData.registrationNumber.trim())
      formDataToSend.append("pricePerDay", formData.pricePerDay)
      formDataToSend.append("description", formData.description.trim())

      if (selectedImage) {
        formDataToSend.append("image", selectedImage)
      }

      const response = await fetch("https://bajaj-rent-system-backend.onrender.com/api/bajaj", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      const responseData = await response.json()

      if (response.ok) {
        resetForm()
        setShowAddModal(false)
        await fetchBajajs()
        alert("Vehicle added successfully!")
      } else {
        throw new Error(responseData.message || "Failed to add vehicle")
      }
    } catch (error) {
      console.error("Error adding Bajaj:", error)
      alert(error.message || "Failed to add vehicle. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditBajaj = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const formDataToSend = new FormData()
      formDataToSend.append("model", formData.model.trim())
      formDataToSend.append("registrationNumber", formData.registrationNumber.trim())
      formDataToSend.append("pricePerDay", formData.pricePerDay)
      formDataToSend.append("description", formData.description.trim())

      if (selectedImage) {
        formDataToSend.append("image", selectedImage)
      }

      const response = await fetch(`https://bajaj-rent-system-backend.onrender.com/api/bajaj/${editingBajaj._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      const responseData = await response.json()

      if (response.ok) {
        resetForm()
        setShowAddModal(false)
        await fetchBajajs()
        alert("Vehicle updated successfully!")
      } else {
        throw new Error(responseData.message || "Failed to update vehicle")
      }
    } catch (error) {
      console.error("Error updating Bajaj:", error)
      alert(error.message || "Failed to update vehicle. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBajaj = async (id) => {
    if (window.confirm("Are you sure you want to delete this Bajaj?")) {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await fetch(`https://bajaj-rent-system-backend.onrender.com/api/bajaj/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        const responseData = await response.json()

        if (response.ok) {
          await fetchBajajs()
          alert("Vehicle deleted successfully!")
        } else {
          throw new Error(responseData.message || "Failed to delete vehicle")
        }
      } catch (error) {
        console.error("Error deleting Bajaj:", error)
        alert(error.message || "Failed to delete vehicle. Please try again.")
      }
    }
  }

  const handleEditClick = (bajaj) => {
    setEditingBajaj(bajaj)
    setFormData({
      model: bajaj.model,
      registrationNumber: bajaj.registrationNumber,
      pricePerDay: bajaj.pricePerDay,
      description: bajaj.description,
    })
    setShowAddModal(true)
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`https://bajaj-rent-system-backend.onrender.com/api/booking/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      const responseData = await response.json()

      if (response.ok) {
        await fetchBookings()
        await fetchBajajs()
        alert("Booking status updated successfully!")
      } else {
        throw new Error(responseData.message || "Failed to update booking status")
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
      alert(error.message || "Failed to update booking status. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={fetchData}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Ensure arrays are valid before using filter
  const availableBajajs = Array.isArray(bajajs) ? bajajs.filter((b) => b && b.isAvailable) : []
  const totalRevenue = Array.isArray(bookings)
    ? bookings.reduce((sum, booking) => sum + (booking?.totalAmount || 0), 0)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your Bajaj fleet and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{bajajs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{availableBajajs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bajaj Management */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Vehicle Management</h2>
            <button
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              + Add New Bajaj
            </button>
          </div>

          {bajajs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-500 mb-4">Start by adding your first Bajaj vehicle to the fleet.</p>
              <button
                onClick={() => {
                  resetForm()
                  setShowAddModal(true)
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Add First Vehicle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bajajs.map((bajaj) => (
                <BajajCard
                  key={bajaj._id}
                  bajaj={bajaj}
                  showActions={true}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteBajaj}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bookings Management */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
          </div>

          {bookings.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500">Bookings will appear here once users start making reservations.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.user?.name || "N/A"}</div>
                          <div className="text-sm text-gray-500">{booking.user?.email || "N/A"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.bajaj?.model || "N/A"}</div>
                        <div className="text-sm text-gray-500">{booking.bajaj?.registrationNumber || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "N/A"} -{" "}
                        {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{booking.totalAmount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {booking.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={booking.status || "pending"}
                          onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            resetForm()
          }}
          title={editingBajaj ? "Edit Bajaj" : "Add New Bajaj"}
        >
          <form onSubmit={editingBajaj ? handleEditBajaj : handleAddBajaj} className="space-y-4">
            <ImageUpload onImageSelect={setSelectedImage} currentImage={editingBajaj?.image} className="mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Registration Number"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <input
              type="number"
              placeholder="Price per Day"
              value={formData.pricePerDay}
              onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              rows={3}
            />

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingBajaj ? "Update Bajaj" : "Add Bajaj"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}

export default AdminDashboard
