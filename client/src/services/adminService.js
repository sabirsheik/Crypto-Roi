// src/services/adminService.js
import api from "./api";

export function fetchAdmins() {
  return api.get("/api/admin/admins");
}
export function createAdmin(payload) {
  return api.post("/api/admin/create", payload);
}
// update by id
export function updateAdminById(id, payload) {
  return api.put(`/api/admin/${encodeURIComponent(id)}`, payload);
}
export function deleteAdminById(id, hard = false) {
  return api.delete(`/api/admin/${encodeURIComponent(id)}${hard ? "?hard=true" : ""}`);
}
