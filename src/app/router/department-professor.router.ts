import api from "@/lib/axios";
import { z } from "zod";
import { handleApiError } from "@/utils/errors/handleApiError";
import { DepartmentProfessorsResponseSchema,CreateCourseProfessorsSchema } from "@/lib/schemas/departmentProfessor.schema";


export const getProfessorByDepartment = async (id: number) => {
  try {
    const response = await api.get(`/course-professor/${id}`);
    return DepartmentProfessorsResponseSchema.parse(response.data);
  } catch (error) {
    throw handleApiError(error, "Failed to fetch Professors");
  }
};

export type CreateCourseProfessorsPayload = z.infer<typeof CreateCourseProfessorsSchema>;

export const createMultipleCourseProfessors = async (
  payload: CreateCourseProfessorsPayload
) => {
  try {
    // Validate the input against your schema before sending
    const validPayload = CreateCourseProfessorsSchema.parse(payload);

    const response = await api.post(`/course-professor/create-multiple`, validPayload);

    // Depending on backend, you might want to validate response too
    // return SomeResponseSchema.parse(response.data);
    console.log(response.data, "api payload")
    return response.data;
  } catch (error) {
    console.log(error, "api error")
    throw handleApiError(error, "Failed to assign professors to course");
  }
};