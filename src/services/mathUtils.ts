import { LocationPoint, IterationStep, CalculationDetails } from '../types';

export const calculateEuclideanDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

export const calculateTotalCost = (centerX: number, centerY: number, points: LocationPoint[]): number => {
  return points.reduce((acc, point) => {
    const dist = calculateEuclideanDistance(centerX, centerY, point.x, point.y);
    return acc + (dist * point.weight);
  }, 0);
};

export const runIterationStep = (
  currentX: number, 
  currentY: number, 
  points: LocationPoint[], 
  stepIndex: number
): IterationStep => {
  let numeratorX = 0;
  let numeratorY = 0;
  let denominator = 0;

  // Avoid division by zero by adding a tiny epsilon if distance is 0
  const epsilon = 0.0001;

  for (const point of points) {
    let dist = calculateEuclideanDistance(currentX, currentY, point.x, point.y);
    if (dist === 0) dist = epsilon;

    const factor = point.weight / dist;
    
    numeratorX += factor * point.x;
    numeratorY += factor * point.y;
    denominator += factor;
  }

  const newX = numeratorX / denominator;
  const newY = numeratorY / denominator;
  const cost = calculateTotalCost(newX, newY, points);

  const calcDetails: CalculationDetails = {
    stepType: 'iterative',
    formula: 'X = Σ(WiXi/di) / Σ(Wi/di)',
    numeratorX,
    denominatorX: denominator,
    numeratorY,
    denominatorY: denominator
  };

  return {
    step: stepIndex,
    x: newX,
    y: newY,
    distanceCost: cost,
    calculation: calcDetails
  };
};

export const initializeCenter = (points: LocationPoint[]): { result: { x: number, y: number }, calculation: CalculationDetails } => {
  // Initial estimate: Standard Center of Gravity
  // Formula: X = Σ(Wi * Xi) / ΣWi
  
  let sumWX = 0;
  let sumWY = 0;
  let sumW = 0;

  points.forEach(p => {
    sumWX += p.weight * p.x;
    sumWY += p.weight * p.y;
    sumW += p.weight;
  });

  const x = sumWX / sumW;
  const y = sumWY / sumW;

  return {
    result: { x, y },
    calculation: {
      stepType: 'initial',
      formula: 'X = Σ(Wi * Xi) / ΣWi',
      numeratorX: sumWX,
      numeratorY: sumWY,
      denominatorX: sumW,
      denominatorY: sumW
    }
  };
};