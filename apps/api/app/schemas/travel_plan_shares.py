from pydantic import BaseModel, EmailStr, Field


class TravelPlanShareCreateResponse(BaseModel):
    travel_plan_id: str
    invited_email: EmailStr
    status: str


class TravelPlanShareCreateRequest(BaseModel):
    invited_email: EmailStr = Field(..., description="Email address of the invited friend")


class TravelPlanShareAcceptRequest(BaseModel):
    token: str = Field(..., min_length=16, description="Invite confirmation token")


class TravelPlanShareAcceptResponse(BaseModel):
    travel_plan_id: str
    status: str
