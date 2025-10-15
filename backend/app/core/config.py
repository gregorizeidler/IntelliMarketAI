from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    OPENAI_API_KEY: str = Field(..., description="Your OpenAI API key")
    GOOGLE_MAPS_API_KEY: str = Field(..., description="Google Maps Platform API key with Places (New) + Geocoding enabled")

    GOOGLE_PLACES_MAX_RESULTS: int = 15
    GOOGLE_REVIEWS_MAX_PER_PLACE: int = 10
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_TEMPERATURE: float = 0.2
    LANGUAGE_CODE: str = "pt-BR"

    class Config:
        env_file = ".env"

settings = Settings()
