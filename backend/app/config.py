from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    frontend_origin: str = "http://localhost:5173"
    SECRET_KEY: str = "your-super-secret-key-change-in-production-12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = "../.env"
        extra = "ignore"


settings = Settings()
