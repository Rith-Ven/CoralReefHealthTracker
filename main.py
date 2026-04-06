from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import crud, models, schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Coral Reef Health Tracker API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, DELETE, etc.)
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/reefs/", response_model=schemas.Reef)
def create_reef(reef: schemas.ReefCreate, db: Session = Depends(get_db)):
    return crud.create_reef(db=db, reef=reef)

@app.get("/reefs/", response_model=List[schemas.Reef])
def read_reefs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    reefs = crud.get_reefs(db, skip=skip, limit=limit)
    return reefs

@app.delete("/reefs/{reef_id}", response_model=schemas.Reef)
def delete_reef(reef_id: int, db: Session = Depends(get_db)):
    db_reef = crud.delete_reef(db, reef_id=reef_id)
    if db_reef is None:
        raise HTTPException(status_code=404, detail="Reef not found")
    return db_reef

@app.post("/observations/", response_model=schemas.Observation)
def create_observation(observation: schemas.ObservationCreate, db: Session = Depends(get_db)):
    db_reef = crud.get_reef(db, reef_id=observation.reef_id)
    if db_reef is None:
        raise HTTPException(status_code=404, detail="Reef not found")
    return crud.create_observation(db=db, observation=observation)

@app.get("/observations/", response_model=List[schemas.Observation])
def read_observations(
    reef_id: Optional[int] = None, 
    location: Optional[str] = None, 
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    observations = crud.get_observations(
        db, reef_id=reef_id, location=location, 
        start_date=start_date, end_date=end_date, 
        skip=skip, limit=limit
    )
    return observations

@app.delete("/observations/{observation_id}", response_model=schemas.Observation)
def delete_observation(observation_id: int, db: Session = Depends(get_db)):
    db_obs = crud.delete_observation(db, observation_id=observation_id)
    if db_obs is None:
        raise HTTPException(status_code=404, detail="Observation not found")
    return db_obs

@app.put("/observations/{observation_id}", response_model=schemas.Observation)
def update_observation(observation_id: int, observation: schemas.ObservationUpdate, db: Session = Depends(get_db)):
    db_obs = crud.update_observation(db, observation_id=observation_id, observation=observation)
    if db_obs is None:
        raise HTTPException(status_code=404, detail="Observation not found")
    return db_obs

@app.get("/trends/{reef_id}", response_model=schemas.Trend)
def read_reef_trends(reef_id: int, db: Session = Depends(get_db)):
    db_reef = crud.get_reef(db, reef_id=reef_id)
    if db_reef is None:
        raise HTTPException(status_code=404, detail="Reef not found")
    trends = crud.get_reef_trends(db, reef_id=reef_id)
    if trends is None:
        raise HTTPException(status_code=404, detail="No observations found for this reef")
    return trends

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)
