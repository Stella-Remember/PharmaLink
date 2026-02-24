import api from "./client"

export const reportsAPI = {
  getOwnerSales: () => api.get("/reports/owner/sales")
}