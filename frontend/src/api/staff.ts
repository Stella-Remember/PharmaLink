import api from "./client"

export const staffAPI = {
  create: (data: any) => api.post("/staff", data)
}