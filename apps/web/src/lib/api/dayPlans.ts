import { apiClient } from "./client";

export interface ItineraryItemApiResponse {
  id: string;
  travel_plan_id: string;
  date: string;
  time: string | null;
  description: string;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDayPlanRequest {
  description: string;
}

export interface UpdateDayPlanRequest {
  description: string;
}

export async function fetchDayPlans(
  travelPlanId: string,
  day: string,
  accessToken: string,
): Promise<ItineraryItemApiResponse[]> {
  const response = await apiClient.get<ItineraryItemApiResponse[]>(
    `/v1/travel-plans/${travelPlanId}/days/${day}/items`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}

export async function createDayPlan(
  travelPlanId: string,
  day: string,
  payload: CreateDayPlanRequest,
  accessToken: string,
): Promise<ItineraryItemApiResponse> {
  const response = await apiClient.post<ItineraryItemApiResponse>(
    `/v1/travel-plans/${travelPlanId}/days/${day}/items`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}

export async function updateDayPlan(
  travelPlanId: string,
  day: string,
  itemId: string,
  payload: UpdateDayPlanRequest,
  accessToken: string,
): Promise<ItineraryItemApiResponse> {
  const response = await apiClient.put<ItineraryItemApiResponse>(
    `/v1/travel-plans/${travelPlanId}/days/${day}/items/${itemId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}
