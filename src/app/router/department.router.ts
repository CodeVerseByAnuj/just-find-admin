// utils/api/auth.ts
import api from "@/lib/axios";
import { z } from "zod";
import { AddDepartment, departmentSchema } from "@/lib/schemas/department.schema";
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";

export const createDepartment = async (payload: AddDepartment) => {
  try {
    const response = await api.post("/departments", payload);
    // ✅ Show success toast
    handleSuccessMessage(response, "Department created successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to create department");
  }
};

export const updateDepartment = async (id: number, payload: AddDepartment) => {
  try {
    const response = await api.patch(`/departments/${id}`, payload);
    // ✅ Show success toast
    handleSuccessMessage(response, "Department updated successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to update department");
  }
};

export const deleteDepartment = async (id: number) => {
  try {
    const response = await api.delete(`/departments/${id}`);
    // ✅ Show success toast
    handleSuccessMessage(response, "Department deleted successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to delete department");
  }
};

export const getDepartmentById = async (id: number) => {
  try {
    const response = await api.get(`/departments/${id}`);
    return departmentSchema.parse(response.data);
  } catch (error) {
    throw handleApiError(error, "Failed to fetch department");
  }
};

export const getAllDepartments = async () => {
  try {
    const response = await api.get("/departments");

    const rawDepartments = response.data.data;

    // ✅ Defensive check
    if (!Array.isArray(rawDepartments)) {
      throw new Error("Invalid department data format: not an array");
    }

    const departments = rawDepartments.map((dept: any) =>
      departmentSchema.parse(dept)
    );

    return { data: departments };
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw handleApiError(error, "Failed to fetch departments");
  }
};

