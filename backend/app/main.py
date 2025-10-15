import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from .models import (
    AnalysisRequest, AnalysisResponse, LatLng, PlaceBasic,
    CompetitorResult, CompetitorAIAnalysis, AggregatedReport
)
from .clients import google as gmaps
from .clients.openai_client import analyze_competitor_async, aggregate_report_async
from .routes_advanced import router as advanced_router

app = FastAPI(title="IntelliMarket Analyzer API", version="1.0.0")

# Registrar rotas avançadas
app.include_router(advanced_router)

# CORS: em desenvolvimento tudo liberado, sem credenciais para evitar erro com '*'.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze(req: AnalysisRequest):
    # Passo 1: Geocode
    latlng = gmaps.geocode_address(req.address)
    if not latlng:
        raise HTTPException(status_code=404, detail="Endereço não encontrado")

    lat, lng = latlng
    center = LatLng(latitude=lat, longitude=lng)

    # Passo 2: Concorrentes via Text Search (New)
    raw_places = gmaps.text_search_places(req.business_type, lat, lng, req.radius)
    if not raw_places:
        return AnalysisResponse(
            input=req, center=center, radius=req.radius,
            competitors=[],
            aggregated_report=AggregatedReport(
                market_saturation_level="Baixa",
                market_strengths_summary=[],
                market_weaknesses_gaps=["Pouca concorrência mapeada para este termo."],
                strategic_recommendation="Aprofunde a busca com termos alternativos e valide demanda local."
            ),
            meta={"notes": "Nenhum lugar retornado pelo Text Search dentro do raio."}
        )

    places_norm = [gmaps.normalize_text_search_place(p) for p in raw_places]
    place_id_list = [p["place_id"] for p in places_norm if p.get("place_id")]

    # Passo 3: Details + Reviews (batch)
    details_by_id = gmaps.get_place_details_batch(place_id_list, 10)

    # Passo 4: IA por concorrente (paralelo)
    tasks = []
    for p in places_norm:
        pid = p["place_id"]
        reviews = details_by_id.get(pid, {}).get("_extractedReviewTexts", [])
        tasks.append(analyze_competitor_async(req.business_type, reviews))
    analyses: List[Dict[str, Any]] = await asyncio.gather(*tasks)

    competitors: List[CompetitorResult] = []
    for p, ai_json in zip(places_norm, analyses):
        competitors.append(
            CompetitorResult(
                place=PlaceBasic(
                    place_id=p["place_id"],
                    display_name=p["display_name"],
                    formatted_address=p["formatted_address"],
                    location=LatLng(**p["location"]),
                    rating=p.get("rating"),
                    user_rating_count=p.get("user_rating_count"),
                    google_maps_uri=p.get("google_maps_uri")
                ),
                ai=CompetitorAIAnalysis(
                    overall_sentiment_score=float(ai_json.get("overall_sentiment_score", 0.0)),
                    strengths=ai_json.get("strengths", []),
                    weaknesses=ai_json.get("weaknesses", []),
                    actionable_opportunities=ai_json.get("actionable_opportunities", []),
                    executive_summary=ai_json.get("executive_summary", "")
                )
            )
        )

    # Passo 5: Agregado
    consolidated = []
    for c in competitors:
        consolidated.append({
            "name": c.place.display_name,
            "strengths": c.ai.strengths,
            "weaknesses": c.ai.weaknesses
        })
    agg_json = await aggregate_report_async(req.business_type, consolidated)
    aggregated = AggregatedReport(
        market_saturation_level=agg_json.get("market_saturation_level", "Média"),
        market_strengths_summary=agg_json.get("market_strengths_summary", []),
        market_weaknesses_gaps=agg_json.get("market_weaknesses_gaps", []),
        strategic_recommendation=agg_json.get("strategic_recommendation", "")
    )

    return AnalysisResponse(
        input=req,
        center=center,
        radius=req.radius,
        competitors=competitors,
        aggregated_report=aggregated,
        meta={
            "counts": {"places_found": len(places_norm), "analyzed": len(competitors)}
        }
    )
