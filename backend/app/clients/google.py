import requests
from typing import List, Dict, Any, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

from ..core.config import settings

GOOGLE_API_KEY = settings.GOOGLE_MAPS_API_KEY

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
PLACE_DETAILS_URL_TMPL = "https://places.googleapis.com/v1/places/{place_id}"

DEFAULT_SESSION = requests.Session()
DEFAULT_TIMEOUT = 15

def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    params = {"address": address, "key": GOOGLE_API_KEY, "language": settings.LANGUAGE_CODE}
    r = DEFAULT_SESSION.get(GEOCODE_URL, params=params, timeout=DEFAULT_TIMEOUT)
    r.raise_for_status()
    data = r.json()
    if data.get("status") != "OK" or not data.get("results"):
        return None
    loc = data["results"][0]["geometry"]["location"]
    return (loc["lat"], loc["lng"])

def text_search_places(business_type: str, lat: float, lng: float, radius_m: int) -> List[Dict[str, Any]]:
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": ",".join([
            "places.id",
            "places.displayName",
            "places.formattedAddress",
            "places.location",
            "places.rating",
            "places.userRatingCount",
            "places.googleMapsUri",
        ])
    }
    body = {
        "textQuery": business_type,
        "maxResultCount": min(settings.GOOGLE_PLACES_MAX_RESULTS, 20),
        "languageCode": settings.LANGUAGE_CODE,
        "locationBias": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": float(radius_m)
            }
        }
    }
    r = DEFAULT_SESSION.post(TEXT_SEARCH_URL, json=body, headers=headers, timeout=DEFAULT_TIMEOUT)
    r.raise_for_status()
    data = r.json()
    return data.get("places", []) or []

def _extract_review_texts(place_details: Dict[str, Any], limit: int) -> List[str]:
    reviews = place_details.get("reviews") or []
    texts = []
    for rev in reviews[:limit]:
        if isinstance(rev.get("text"), dict):
            t = rev["text"].get("text")
            if t:
                texts.append(t)
        elif isinstance(rev.get("text"), str):
            texts.append(rev["text"])
    return texts

def get_place_details_batch(place_ids: List[str], reviews_limit: int) -> Dict[str, Dict[str, Any]]:
    results: Dict[str, Dict[str, Any]] = {}
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": ",".join(["id","displayName","rating","userRatingCount","reviews"])
    }

    def fetch_one(pid: str):
        url = PLACE_DETAILS_URL_TMPL.format(place_id=pid)
        resp = DEFAULT_SESSION.get(url, headers=headers, timeout=DEFAULT_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        data["_extractedReviewTexts"] = _extract_review_texts(data, reviews_limit)
        return pid, data

    with ThreadPoolExecutor(max_workers=min(16, len(place_ids) or 1)) as pool:
        futures = [pool.submit(fetch_one, pid) for pid in place_ids]
        for fut in as_completed(futures):
            pid, data = fut.result()
            results[pid] = data

    return results

def normalize_text_search_place(p: Dict[str, Any]) -> Dict[str, Any]:
    name = p.get("displayName", {})
    display_name = name.get("text") if isinstance(name, dict) else (name or "")
    loc = p.get("location", {})
    return {
        "place_id": p.get("id") or "",
        "display_name": display_name or "",
        "formatted_address": p.get("formattedAddress") or "",
        "location": {
            "latitude": loc.get("latitude"),
            "longitude": loc.get("longitude"),
        },
        "rating": p.get("rating"),
        "user_rating_count": p.get("userRatingCount"),
        "google_maps_uri": p.get("googleMapsUri"),
    }
