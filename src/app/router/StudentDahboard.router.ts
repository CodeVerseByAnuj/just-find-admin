import api from "@/lib/axios";
import { studentDashboardRankSchema, studentDashboardCardSchema, studentDashboardMarksSchema, studentDashboardPercentileSchema } from "@/lib/schemas/studentDashboard.schema";
import { handleApiError } from "@/utils/errors/handleApiError";

// 🔹 Get student dashboard card by ID
export const getStudentDashboardCard = async (id: number) => {
    try {
        const response = await api.get(`/students/student-dashboard-info/${id}`);
        const parsed = studentDashboardCardSchema.parse(response.data.data);
        return parsed;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getStudentSemesterTypes = async () => {
    try {
        const response = await api.get("/semester/student");
        return response.data.data;
    } catch (error) {
        handleApiError(error, "Failed to fetch semester types");
        return [];
    }
};

export const getStudentDashboardMarks = async (id: number) => {
    try {
        const response = await api.get(`/students/student-dashboard-marks-info/${id}`);
        const parsed = studentDashboardMarksSchema.parse(response.data.data);
        return parsed;
    } catch (error) {
        console.error('❌ Error:', error);
        throw handleApiError(error);
    }
};


export const getStudentDashboardRanks = async (id: number) => {
    try {
        const response = await api.get(`/students/student-dashboard-exam-rank-info/${id}`);
        const parsed = studentDashboardRankSchema.parse(response.data.data);
        return parsed;
    } catch (error) {
        console.error('❌ Error:', error);
        throw handleApiError(error);
    }
};

export const getStudentDashboardPercentile = async (id: number) => {
    try {
        const response = await api.get(`/students/student-dashboard-percentile-info/${id}`);
        const parsed = studentDashboardPercentileSchema.parse(response.data.data);
        return parsed;
    } catch (error) {
        console.error('❌ Error:', error);
        throw handleApiError(error);
    }
};