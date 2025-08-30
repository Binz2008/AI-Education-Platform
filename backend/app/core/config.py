from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API Configuration
    API_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "AI Education Platform"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    JWT_SECRET_KEY: str = "jwt-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "postgresql://dev_user:dev_password@localhost:5432/ai_education"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # CORS & Security
    ALLOWED_HOSTS: list[str] = ["localhost", "127.0.0.1"]
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "https://ai-education-platform.com"]

    # GitHub Integration
    GITHUB_TOKEN: str | None = None
    GITHUB_REPO_OWNER: str = "Binz2008"
    GITHUB_REPO_NAME: str = "AI-Education-Platform"

    # AI Services
    OPENAI_API_KEY: str | None = None
    ANTHROPIC_API_KEY: str | None = None
    HUGGINGFACE_TOKEN: str | None = None
    DEEPSEEK_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None

    # Notion Integration
    NOTION_TOKEN: str | None = None
    NOTION_TASKS_DB: str | None = None
    NOTION_METRICS_DB: str | None = None
    NOTION_SPRINTS_DB: str | None = None

    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_AUDIO_FORMATS: list[str] = ["wav", "mp3", "m4a", "ogg"]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000

    # Child Safety
    MAX_SESSION_DURATION_MINUTES: int = 45
    DEFAULT_DAILY_TIME_LIMIT: int = 30  # minutes
    VOICE_RECORDING_MAX_DURATION: int = 30  # seconds
    CHAT_MESSAGE_MAX_LENGTH: int = 500

    # Data Retention
    CHAT_RETENTION_DAYS: int = 30
    AUDIO_RETENTION_DAYS: int = 7
    SESSION_LOG_RETENTION_DAYS: int = 90

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "app.log"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
