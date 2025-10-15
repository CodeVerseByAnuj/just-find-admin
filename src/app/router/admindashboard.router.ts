import { adminCourseSchema, AdminDashboard, adminDashboardSchema } from "@/lib/schemas/adminDashboard.schema";
import api from "@/lib/axios";
import { handleApiError } from "@/utils/errors/handleApiError";

export const getAdminDashboard = async () => {
    const response = await api.get("/professors/admin-dashboard");
    const parsed = adminCourseSchema.parse(response.data);
    // ✅ Validate response with Zod schema
    return parsed.data
};

export const getAdminDashboardAlerts = async () => {
  try {
    const response = await api.get("/professors/admin-dashboard/alerts");

    // ✅ use response.data.data, not response.data
    const parsed = adminDashboardSchema.parse(response.data.data);

    return parsed;
  } catch (error: any) {
    console.error("Failed to fetch admin dashboard alerts:", error);
    handleApiError(error);
  }
};


