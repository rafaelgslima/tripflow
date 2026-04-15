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

export interface CreateTravelPlanShareInviteRequest {
  invited_email: string;
}

export interface TravelPlanShareInviteApiResponse {
  travel_plan_id: string;
  invited_email: string;
  status: string;
}

export interface AcceptTravelPlanShareInviteRequest {
  token: string;
}

export interface AcceptTravelPlanShareInviteApiResponse {
  travel_plan_id: string;
  status: string;
}

export async function createTravelPlan(
  payload: CreateTravelPlanRequest,
  accessToken: string,
): Promise<TravelPlanApiResponse> {
  const response = await apiClient.post<TravelPlanApiResponse>(
    "/travel-plans",
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
    "/travel-plans",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}

export async function createTravelPlanShareInvite(
  travelPlanId: string,
  payload: CreateTravelPlanShareInviteRequest,
  accessToken: string,
): Promise<TravelPlanShareInviteApiResponse> {
  const response = await apiClient.post<TravelPlanShareInviteApiResponse>(
    `/travel-plans/${travelPlanId}/shares`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}

export async function deleteTravelPlan(
  travelPlanId: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/travel-plans/${travelPlanId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export interface TravelPlanShareRecord {
  id: string;
  invited_email: string;
  status: "pending" | "accepted";
  invited_name: string | null;
}

export async function fetchTravelPlanShares(
  travelPlanId: string,
  accessToken: string,
): Promise<TravelPlanShareRecord[]> {
  const response = await apiClient.get<TravelPlanShareRecord[]>(
    `/travel-plans/${travelPlanId}/shares`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}

export async function acceptTravelPlanShareInvite(
  payload: AcceptTravelPlanShareInviteRequest,
  accessToken: string,
): Promise<AcceptTravelPlanShareInviteApiResponse> {
  const response = await apiClient.post<AcceptTravelPlanShareInviteApiResponse>(
    "/v1/travel-plan-shares/accept",
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}
