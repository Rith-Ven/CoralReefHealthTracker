export interface ObservationBase {
  reef_id: number;
  date?: string;
  temperature: number;
  bleaching_level: number;
  biodiversity_score: number;
  notes?: string;
}

export interface Observation extends ObservationBase {
  id: number;
}

export interface ObservationCreate extends ObservationBase {}

export interface ObservationUpdate {
  temperature?: number;
  bleaching_level?: number;
  biodiversity_score?: number;
  notes?: string;
}

export interface ReefBase {
  name: string;
  location: string;
}

export interface Reef extends ReefBase {
  id: number;
  observations: Observation[];
}

export interface ReefCreate extends ReefBase {}

export interface Trend {
  reef_id: number;
  average_bleaching_level: number;
  average_biodiversity_score: number;
  observation_count: number;
}
