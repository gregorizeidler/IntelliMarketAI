"""
Rotas para Features Avançadas
Endpoints separados que não interferem no fluxo principal
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from .clients.advanced_features import (
    analyze_sentiment_by_aspect,
    generate_customer_persona,
    analyze_review_trends,
    recommend_ideal_location,
    estimate_average_ticket,
    analyze_peak_hours,
    analyze_competitor_photos,
    generate_visual_concept,
    generate_mockup_image
)

router = APIRouter(prefix="/api/advanced", tags=["advanced"])


# ============= MODELS =============

class SentimentByAspectRequest(BaseModel):
    business_type: str
    reviews: List[str]

class PersonaRequest(BaseModel):
    business_type: str
    all_reviews: List[str]
    competitor_names: List[str]

class TrendsRequest(BaseModel):
    reviews_with_dates: List[Dict[str, Any]]
    business_type: str

class LocationRecommendationRequest(BaseModel):
    comparison_data: List[Dict[str, Any]]
    business_type: str

class TicketEstimateRequest(BaseModel):
    reviews: List[str]
    business_type: str

class PeakHoursRequest(BaseModel):
    reviews: List[str]
    popular_times_data: Optional[Dict[str, Any]] = None

class PhotoAnalysisRequest(BaseModel):
    image_urls: List[str]
    business_type: str

class VisualConceptRequest(BaseModel):
    business_type: str
    market_analysis: Dict[str, Any]
    persona: Dict[str, Any]
    best_practices: List[str]

class MockupImageRequest(BaseModel):
    prompt: str


# ============= ENDPOINTS =============

@router.post("/sentiment-by-aspect")
async def sentiment_by_aspect(req: SentimentByAspectRequest):
    """
    Analisa reviews separando por aspectos:
    - Atendimento
    - Produto
    - Preço
    - Ambiente
    - Localização
    - Agilidade
    """
    try:
        result = await analyze_sentiment_by_aspect(req.business_type, req.reviews)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise por aspecto: {str(e)}")


@router.post("/customer-persona")
async def customer_persona(req: PersonaRequest):
    """
    Gera persona detalhada do cliente ideal baseada em reviews reais
    """
    try:
        result = await generate_customer_persona(
            req.business_type,
            req.all_reviews,
            req.competitor_names
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na geração de persona: {str(e)}")


@router.post("/review-trends")
async def review_trends(req: TrendsRequest):
    """
    Analisa tendências temporais dos reviews
    """
    try:
        result = await analyze_review_trends(req.reviews_with_dates, req.business_type)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise de tendências: {str(e)}")


@router.post("/location-recommendation")
async def location_recommendation(req: LocationRecommendationRequest):
    """
    Recomenda a melhor localização baseada em comparação de áreas
    """
    try:
        result = await recommend_ideal_location(req.comparison_data, req.business_type)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na recomendação de localização: {str(e)}")


@router.post("/ticket-estimate")
async def ticket_estimate(req: TicketEstimateRequest):
    """
    Estima ticket médio baseado em menções de preços nos reviews
    """
    try:
        result = await estimate_average_ticket(req.reviews, req.business_type)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na estimativa de ticket: {str(e)}")


@router.post("/peak-hours")
async def peak_hours(req: PeakHoursRequest):
    """
    Analisa horários de pico e padrões de movimento
    """
    try:
        result = await analyze_peak_hours(req.reviews, req.popular_times_data)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise de horários: {str(e)}")


@router.post("/photo-analysis")
async def photo_analysis(req: PhotoAnalysisRequest):
    """
    Analisa fotos dos concorrentes com GPT-4 Vision
    """
    try:
        result = await analyze_competitor_photos(req.image_urls, req.business_type)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise de fotos: {str(e)}")


@router.post("/visual-concept")
async def visual_concept(req: VisualConceptRequest):
    """
    Gera conceito visual detalhado para o negócio
    """
    try:
        result = await generate_visual_concept(
            req.business_type,
            req.market_analysis,
            req.persona,
            req.best_practices
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na geração de conceito: {str(e)}")


@router.post("/generate-mockup")
async def generate_mockup(req: MockupImageRequest):
    """
    Gera imagem mockup com DALL-E 3
    """
    try:
        result = await generate_mockup_image(req.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na geração de mockup: {str(e)}")


# ============= HELPER ENDPOINTS =============

@router.get("/streetview/{place_id}")
async def get_streetview_url(place_id: str):
    """
    Retorna URL do Street View para um place_id
    """
    from ..core.config import settings
    
    # URL do Street View estático
    base_url = "https://maps.googleapis.com/maps/api/streetview"
    params = {
        "size": "600x400",
        "location": f"place_id:{place_id}",
        "key": settings.GOOGLE_MAPS_API_KEY,
        "fov": 90,
        "heading": 0,
        "pitch": 0
    }
    
    url = f"{base_url}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    
    return {
        "success": True,
        "streetview_url": url,
        "place_id": place_id
    }

