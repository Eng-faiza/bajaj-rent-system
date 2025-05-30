export const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => error.message)
    return res.status(400).json({ message: "Validation Error", errors })
  }

  
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" })
  }


  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({ message: `${field} already exists` })
  }

  res.status(500).json({ message: "Server Error" })
}

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}
