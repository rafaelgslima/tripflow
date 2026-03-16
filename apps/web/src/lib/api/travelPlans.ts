import { apiClient } from "./client";

export interface CreateTravelPlanRequest {
  destination_city: string;
  start_date: string;
  end_date: string;
}

export interface TravelPlanApiResponse {
  id: string;
  owner_user_id: string;
  destination_city: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export async function createTravelPlan(
  payload: CreateTravelPlanRequest,
  accessToken: string,
): Promise<TravelPlanApiResponse> {
  const response = await apiClient.post<TravelPlanApiResponse>(
    "/v1/travel-plans",
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}

export async function fetchTravelPlans(
  accessToken: string,
): Promise<TravelPlanApiResponse[]> {
  const response = await apiClient.get<TravelPlanApiResponse[]>(
    "/v1/travel-plans",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}
