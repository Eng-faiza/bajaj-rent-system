const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const api = {
  // Auth endpoints
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
    return response.json()
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    return response.json()
  },

  // Bajaj endpoints
  getBajajs: async () => {
    const response = await fetch(`${API_BASE_URL}/bajaj`)
    return response.json()
  },

  getAvailableBajajs: async () => {
    const response = await fetch(`${API_BASE_URL}/bajaj/available`)
    return response.json()
  },

  addBajaj: async (bajajData) => {
    const response = await fetch(`${API_BASE_URL}/bajaj`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(bajajData),
    })
    return response.json()
  },

  deleteBajaj: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bajaj/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  // Booking endpoints
  createBooking: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/booking`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData),
    })
    return response.json()
  },

  getMyBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/booking/my-bookings`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getAllBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/booking/all`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  updateBookingStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/booking/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    })
    return response.json()
  },
}
