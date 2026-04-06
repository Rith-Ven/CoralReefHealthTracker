import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
from main import app, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_create_reef():
    response = client.post(
        "/reefs/",
        json={"name": "Great Barrier Reef", "location": "Australia"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Great Barrier Reef"
    assert "id" in data

def test_read_reefs():
    response = client.get("/reefs/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

def test_create_observation():
    # Ensure a reef exists
    reef_response = client.post(
        "/reefs/",
        json={"name": "Belize Barrier Reef", "location": "Belize"},
    )
    reef_id = reef_response.json()["id"]

    response = client.post(
        "/observations/",
        json={
            "reef_id": reef_id,
            "temperature": 28.5,
            "bleaching_level": 10,
            "biodiversity_score": 85,
            "notes": "Looks healthy"
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["reef_id"] == reef_id
    assert data["temperature"] == 28.5

def test_read_observations_filter():
    response = client.get("/observations/?location=Belize")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["notes"] == "Looks healthy"

def test_read_trends():
    reef_response = client.post(
        "/reefs/",
        json={"name": "Tubbataha Reef", "location": "Philippines"},
    )
    reef_id = reef_response.json()["id"]

    client.post(
        "/observations/",
        json={
            "reef_id": reef_id,
            "temperature": 29.0,
            "bleaching_level": 20,
            "biodiversity_score": 70,
            "notes": "Observation 1"
        },
    )
    client.post(
        "/observations/",
        json={
            "reef_id": reef_id,
            "temperature": 30.0,
            "bleaching_level": 40,
            "biodiversity_score": 60,
            "notes": "Observation 2"
        },
    )

    response = client.get(f"/trends/{reef_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["average_bleaching_level"] == 30.0
    assert data["average_biodiversity_score"] == 65.0
    assert data["observation_count"] == 2
