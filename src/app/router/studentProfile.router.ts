import api from "@/lib/axios";
import {
  UpdateStudentProfile,
  StudentProfileSchema,
} from "@/lib/schemas/studentProfile.schema";
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";

export const updateStudentProfile = async (data: UpdateStudentProfile) => {
  try {
    const response = await api.put(`/student-auth/update-student-profile-info`, data);
    handleSuccessMessage("Student profile updated successfully");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getStudentProfile = async () => {
  try {
    const response = await api.get(`/student-auth/student-profile-info`);
    const parsed = StudentProfileSchema.parse(response.data.data);
    return parsed;
  } catch (error) {
    console.log(error, "error");
    handleApiError(error);
    return null;
  }
};

export const changeStudentPassword = async (data: { password: string }) => {
  try {
    const response = await api.post(`/student-auth/change-student-password`, data);
    handleSuccessMessage("Password changed successfully");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
