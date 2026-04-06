from sqlalchemy.orm import Session
from datetime import datetime
import models, schemas

def get_reef(db: Session, reef_id: int):
    return db.query(models.Reef).filter(models.Reef.id == reef_id).first()

def get_reefs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Reef).offset(skip).limit(limit).all()

def create_reef(db: Session, reef: schemas.ReefCreate):
    db_reef = models.Reef(name=reef.name, location=reef.location)
    db.add(db_reef)
    db.commit()
    db.refresh(db_reef)
    return db_reef

def delete_reef(db: Session, reef_id: int):
    db_reef = db.query(models.Reef).filter(models.Reef.id == reef_id).first()
    if db_reef:
        db.delete(db_reef)
        db.commit()
    return db_reef

def create_observation(db: Session, observation: schemas.ObservationCreate):
    db_observation = models.Observation(**observation.model_dump())
    db.add(db_observation)
    db.commit()
    db.refresh(db_observation)
    return db_observation

def update_observation(db: Session, observation_id: int, observation: schemas.ObservationUpdate):
    db_obs = db.query(models.Observation).filter(models.Observation.id == observation_id).first()
    if db_obs:
        update_data = observation.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_obs, key, value)
        db.commit()
        db.refresh(db_obs)
    return db_obs

def delete_observation(db: Session, observation_id: int):
    db_obs = db.query(models.Observation).filter(models.Observation.id == observation_id).first()
    if db_obs:
        db.delete(db_obs)
        db.commit()
    return db_obs

def get_observations(
    db: Session, 
    reef_id: int = None, 
    location: str = None, 
    start_date: datetime = None, 
    end_date: datetime = None, 
    skip: int = 0, 
    limit: int = 100
):
    query = db.query(models.Observation)
    if reef_id:
        query = query.filter(models.Observation.reef_id == reef_id)
    if location:
        query = query.join(models.Reef).filter(models.Reef.location == location)
    if start_date:
        query = query.filter(models.Observation.date >= start_date)
    if end_date:
        query = query.filter(models.Observation.date <= end_date)
    return query.offset(skip).limit(limit).all()

def get_reef_trends(db: Session, reef_id: int):
    observations = db.query(models.Observation).filter(models.Observation.reef_id == reef_id).all()
    if not observations:
        return None
    
    avg_bleaching = sum(o.bleaching_level for o in observations) / len(observations)
    avg_biodiversity = sum(o.biodiversity_score for o in observations) / len(observations)
    
    return {
        "reef_id": reef_id,
        "average_bleaching_level": avg_bleaching,
        "average_biodiversity_score": avg_biodiversity,
        "observation_count": len(observations)
    }
