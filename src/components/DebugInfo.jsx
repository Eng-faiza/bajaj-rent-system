"use client"

import { useState } from "react"

const DebugInfo = () => {
  const [serverStatus, setServerStatus] = useState(null)
  const [apiResponse, setApiResponse] = useState(null)

  const checkServerHealth = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/health")
      const data = await response.json()
      setServerStatus({ status: "Connected", data })
    } catch (error) {
      setServerStatus({ status: "Failed", error: error.message })
    }
  }

  const testBajajAPI = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/bajaj")
      const data = await response.json()
      setApiResponse({ status: response.status, data })
    } catch (error) {
      setApiResponse({ status: "Error", error: error.message })
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-bold mb-4">Debug Information</h3>

      <div className="space-y-4">
        <div>
          <button onClick={checkServerHealth} className="bg-blue-500 text-white px-4 py-2 rounded mr-4">
            Check Server Status
          </button>
          {serverStatus && (
            <div className="mt-2">
              <strong>Server Status:</strong> {serverStatus.status}
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1">{JSON.stringify(serverStatus, null, 2)}</pre>
            </div>
          )}
        </div>

        <div>
          <button onClick={testBajajAPI} className="bg-green-500 text-white px-4 py-2 rounded mr-4">
            Test Bajaj API
          </button>
          {apiResponse && (
            <div className="mt-2">
              <strong>API Response:</strong> Status {apiResponse.status}
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1">{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DebugInfo
