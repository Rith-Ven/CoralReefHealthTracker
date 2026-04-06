from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional

class ObservationBase(BaseModel):
    reef_id: int
    date: Optional[datetime] = None
    temperature: float
    bleaching_level: int = Field(..., ge=0, le=100)
    biodiversity_score: int = Field(..., ge=0, le=100)
    notes: Optional[str] = None

class ObservationCreate(ObservationBase):
    pass

class ObservationUpdate(BaseModel):
    temperature: Optional[float] = None
    bleaching_level: Optional[int] = Field(None, ge=0, le=100)
    biodiversity_score: Optional[int] = Field(None, ge=0, le=100)
    notes: Optional[str] = None

class Observation(ObservationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ReefBase(BaseModel):
    name: str
    location: str

class ReefCreate(ReefBase):
    pass

class Reef(ReefBase):
    id: int
    observations: List[Observation] = []
    model_config = ConfigDict(from_attributes=True)

class Trend(BaseModel):
    reef_id: int
    average_bleaching_level: float
    average_biodiversity_score: float
    observation_count: int
