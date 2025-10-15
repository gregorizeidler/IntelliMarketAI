from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AnalysisRequest(BaseModel):
    business_type: str
    address: str
    radius: int = Field(2000, ge=100, le=50000)

class LatLng(BaseModel):
    latitude: float
    longitude: float

class PlaceBasic(BaseModel):
    place_id: str
    display_name: str
    formatted_address: str
    location: LatLng
    rating: Optional[float] = None
    user_rating_count: Optional[int] = None
    google_maps_uri: Optional[str] = None

class CompetitorAIAnalysis(BaseModel):
    overall_sentiment_score: float
    strengths: List[str]
    weaknesses: List[str]
    actionable_opportunities: List[str]
    executive_summary: str

class CompetitorResult(BaseModel):
    place: PlaceBasic
    ai: CompetitorAIAnalysis

class AggregatedReport(BaseModel):
    market_saturation_level: str
    market_strengths_summary: List[str]
    market_weaknesses_gaps: List[str]
    strategic_recommendation: str

class AnalysisResponse(BaseModel):
    input: AnalysisRequest
    center: LatLng
    radius: int
    competitors: List[CompetitorResult]
    aggregated_report: AggregatedReport
    meta: Dict[str, Any] = {}
