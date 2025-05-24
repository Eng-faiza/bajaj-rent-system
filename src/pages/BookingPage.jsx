"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

const BookingPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bajaj, setBajaj] = useState(null)
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
  })
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    fetchBajaj()
  }, [id])

  useEffect(() => {
    calculateTotal()
  }, [formData, bajaj])

  const fetchBajaj = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bajaj`)
      const data = await response.json()
      const selectedBajaj = data.find((b) => b._id === id)
      setBajaj(selectedBajaj)
    } catch (error) {
      console.error("Error fetching Bajaj:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (bajaj && formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      if (days > 0) {
        setTotalAmount(days * bajaj.pricePerDay)
      } else {
        setTotalAmount(0)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBooking(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bajajId: id,
          startDate: formData.startDate,
          endDate: formData.endDate,
        }),
      })

      if (response.ok) {
        alert("Booking successful!")
        navigate("/dashboard")
      } else {
        const data = await response.json()
        alert(data.message || "Booking failed")
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (!bajaj) {
    return <div className="text-center py-8">Bajaj not found.</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <img
            src={bajaj.image || "/placeholder.svg"}
            alt={bajaj.model}
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="mt-6">
            <h1 className="text-3xl font-bold mb-4">{bajaj.model}</h1>
            <p className="text-gray-600 mb-2">Registration Number: {bajaj.registrationNumber}</p>
            <p className="text-2xl font-bold text-blue-600 mb-4">₹{bajaj.pricePerDay}/day</p>
            <p className="text-gray-700">{bajaj.description}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Book This Bajaj</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                min={formData.startDate || new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {totalAmount > 0 && (
              <div className="mb-6 p-4 bg-gray-100 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">₹{totalAmount}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={booking || totalAmount === 0}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {booking ? "Booking..." : "Book Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
