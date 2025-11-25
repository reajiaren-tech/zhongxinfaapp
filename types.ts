
export interface LocationPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  weight: number; // Calculated as Volume * Rate
  volume: number; // Supply/Demand Amount (tons)
  rate: number;   // Freight Rate (RMB/ton*km)
  type: 'market' | 'supplier'; // Kept for compatibility, though we will mainly use 'market'
}

export interface CalculationDetails {
  stepType: 'initial' | 'iterative';
  formula: string;
  numeratorX: number;
  denominatorX: number; // For initial step, this is sumW. For iterative, it's sum(w/d)
  numeratorY: number;
  denominatorY: number;
  // Arrays for detailed breakdown (optional, for advanced display)
  components?: { id: string; val: number }[];
}

export interface IterationStep {
  step: number;
  x: number;
  y: number;
  distanceCost: number; // Total weighted distance
  explanation?: string;
  calculation?: CalculationDetails;
}

export interface SimulationState {
  points: LocationPoint[];
  currentIteration: number;
  history: IterationStep[];
  converged: boolean;
  threshold: number;
}

export enum Character {
  LOCOMOTIVE = 'Locomotive', // Train Head
  CONTAINER = 'Container'    // Container Box
}
