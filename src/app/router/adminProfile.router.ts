import api from "@/lib/axios";
import {  UpdateAdminProfile , AdminProfile, AdminProfileSchema} from "@/lib/schemas/adminProfile.schema";
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";

export const updateAdminProfile = async (data: UpdateAdminProfile) => {
  try {
    const response = await api.put(`/auth/update-profile-info`, data);
    handleSuccessMessage("Admin profile updated successfully");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminProfile = async () => {
  try {
    const response = await api.get(`/auth/profile-info`);
    AdminProfileSchema.parse(response.data.data);
    return response.data.data;

  } catch (error) {
    handleApiError(error);
  }
};

export const changeAdminPassword = async (data: { password: string }) => {
  try {
    const response = await api.post(`/auth/change-password`, data);
    handleSuccessMessage("Password changed successfully");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
