"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import BajajCard from "../components/BajajCard"
import LoadingSpinner from "../components/LoadingSpinner"

const Home = () => {
  const [bajajs, setBajajs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [priceFilter, setPriceFilter] = useState("")
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchAvailableBajajs()
  }, [])

  const fetchAvailableBajajs = async () => {
    try {
      setError(null)
      const response = await fetch("https://bajaj-rent-system-backend.onrender.com/api/bajaj/available")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Ensure data is an array
      if (Array.isArray(data)) {
        setBajajs(data)
      } else {
        console.error("Expected array but got:", typeof data, data)
        setBajajs([])
        setError("Invalid data format received from server")
      }
    } catch (error) {
      console.error("Error fetching Bajajs:", error)
      setBajajs([])
      setError("Failed to fetch vehicles. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Ensure bajajs is always an array before filtering
  const filteredBajajs = Array.isArray(bajajs)
    ? bajajs.filter((bajaj) => {
        const matchesSearch =
          bajaj.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bajaj.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesPrice =
          priceFilter === "" ||
          (priceFilter === "low" && bajaj.pricePerDay <= 500) ||
          (priceFilter === "medium" && bajaj.pricePerDay > 500 && bajaj.pricePerDay <= 1000) ||
          (priceFilter === "high" && bajaj.pricePerDay > 1000)

        return matchesSearch && matchesPrice
      })
    : []

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Rent Your Perfect
              <span className="block text-yellow-400">Bajaj Ride</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Discover freedom on two wheels. Choose from our premium collection of Bajaj motorcycles for your next
              adventure.
            </p>
            {!user && (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-3 px-8 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => {
                  setError(null)
                  setLoading(true)
                  fetchAvailableBajajs()
                }}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by model or registration number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:w-48">
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Prices</option>
                <option value="low">Under $16</option>
                <option value="medium">$15 - $ 17</option>
                <option value="high">Above $17</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Vehicles ({filteredBajajs.length})</h2>
        </div>

        {/* Bajaj Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBajajs.map((bajaj) => (
            <BajajCard key={bajaj._id} bajaj={bajaj} />
          ))}
        </div>

        {filteredBajajs.length === 0 && !error && (
          <div className="text-center py-16">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
