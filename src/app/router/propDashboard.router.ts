import api from "@/lib/axios";
import { propDashboardResponseSchema , dashboardPerformanceSchema ,professorUpcomingExamsResponseSchema , ProfessorEvaluationInsightsResponse, professorEvaluationInsightsResponseSchema } from "@/lib/schemas/PropDashboard.schema";
import { handleApiError } from "@/utils/errors/handleApiError";

// 🔹 Fetch professor dashboard info by professor ID
export const getPropDashboardByProfessorId = async (id: number) => {
	try {
		const response = await api.get(`/professors/professor-dashboard-info/${id}`);
		// validate shape
		const parsed = propDashboardResponseSchema.parse(response.data);
		return parsed;
	} catch (error) {
		throw handleApiError(error, "Failed to fetch professor dashboard info");
	}
};


/**
 * Fetch professor dashboard performance info by professor ID.
 * @param {number} id - The professor ID
 * @returns {PropDashboardResponse} - The dashboard performance info
 */
export const fetchProfessorDashboardPerformanceInfo = async (id: number) => {
  try {
    const response = await api.get(`/professors/professor-dashboard-performance-info/${id}`);
    const parsed = dashboardPerformanceSchema.parse(response.data.data);
    return parsed;
  } catch (error) {
    handleApiError(error, "Failed to fetch professor dashboard performance info");
    return null;
  }
};


// Fetch upcoming exams for a professor by ID
export const getProfessorUpcomingExams = async (id: number) => {
  try {
    const response = await api.get(`/professors/professor-upcoming-exams/${id}`)
    const parsed = professorUpcomingExamsResponseSchema.parse(response.data);
    return parsed;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch upcoming exams');
  }
};

export const getProfessorEvaluation = async(id:number) => {
	try {
		const response = await api.get(`/professors/professor-evaluation-insights/${id}`);
		const parsed = professorEvaluationInsightsResponseSchema.parse(response.data);
		return parsed.data;
	} catch (error) {
		handleApiError(error, "Failed to fetch professor evaluation");
		return null;
	}
};