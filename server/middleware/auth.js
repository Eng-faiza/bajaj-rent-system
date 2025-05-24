import jwt from "jsonwebtoken"

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    console.log("Auth header:", authHeader ? "Present" : "Missing")
    console.log("Token:", token ? "Present" : "Missing")

    if (!token) {
      return res.status(401).json({ message: "Access token required" })
    }

    jwt.verify(token, process.env.JWT_SECRET || "fallback-secret", (err, user) => {
      if (err) {
        console.error("JWT verification error:", err.message)
        return res.status(403).json({ message: "Invalid or expired token" })
      }

      console.log("Authenticated user:", { userId: user.userId, role: user.role })
      req.user = user
      next()
    })
  } catch (error) {
    console.error("Authentication error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" })
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }
    next()
  } catch (error) {
    console.error("Authorization error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}
