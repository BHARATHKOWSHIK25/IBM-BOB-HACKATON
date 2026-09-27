from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import event
from .config import get_settings

settings = get_settings()

# pool_pre_ping drops stale connections; pool_size keeps warm connections ready
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    from . import models  # noqa: F401 — ensure models are registered
    async with engine.begin() as conn:
        # WAL mode: readers don't block writers, writers don't block readers
        # busy_timeout: wait up to 5 s instead of failing immediately on lock
        # synchronous=NORMAL: safe and ~2× faster than FULL on WAL
        await conn.run_sync(
            lambda c: (
                c.execute(__import__("sqlalchemy").text("PRAGMA journal_mode=WAL")),
                c.execute(__import__("sqlalchemy").text("PRAGMA busy_timeout=5000")),
                c.execute(__import__("sqlalchemy").text("PRAGMA synchronous=NORMAL")),
                c.execute(__import__("sqlalchemy").text("PRAGMA cache_size=-32000")),  # 32 MB
                c.execute(__import__("sqlalchemy").text("PRAGMA temp_store=MEMORY")),
            )
        )
        await conn.run_sync(Base.metadata.create_all)
