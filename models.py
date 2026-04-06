from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Reef(Base):
    __tablename__ = "reefs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String, index=True)

    observations = relationship("Observation", back_populates="reef")

class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    reef_id = Column(Integer, ForeignKey("reefs.id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    temperature = Column(Float)
    bleaching_level = Column(Integer)  # 0-100
    biodiversity_score = Column(Integer)  # 0-100
    notes = Column(String, nullable=True)

    reef = relationship("Reef", back_populates="observations")
