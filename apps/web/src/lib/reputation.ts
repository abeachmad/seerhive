interface Prediction {
  marketId: string;
  prediction: number; // 0-1 probability
  outcome: boolean;
  amount: number;
}

export class ReputationSystem {
  // Calculate Brier Score (lower is better, 0 = perfect)
  static calculateBrierScore(predictions: Prediction[]): number {
    if (predictions.length === 0) return 1;
    
    const sum = predictions.reduce((acc, pred) => {
      const outcomeValue = pred.outcome ? 1 : 0;
      return acc + Math.pow(pred.prediction - outcomeValue, 2);
    }, 0);
    
    return sum / predictions.length;
  }

  // Calculate ELO rating (chess-style)
  static calculateELO(currentELO: number, opponentELO: number, won: boolean, kFactor = 32): number {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentELO - currentELO) / 400));
    const actualScore = won ? 1 : 0;
    return currentELO + kFactor * (actualScore - expectedScore);
  }

  // Calculate accuracy percentage
  static calculateAccuracy(predictions: Prediction[]): number {
    if (predictions.length === 0) return 0;
    
    const correct = predictions.filter(pred => {
      const predictedOutcome = pred.prediction > 0.5;
      return predictedOutcome === pred.outcome;
    }).length;
    
    return (correct / predictions.length) * 100;
  }

  // Calculate profit/loss
  static calculatePnL(predictions: Prediction[]): number {
    return predictions.reduce((acc, pred) => {
      const predictedOutcome = pred.prediction > 0.5;
      if (predictedOutcome === pred.outcome) {
        // Win: return based on odds
        return acc + (pred.amount / pred.prediction);
      } else {
        // Loss
        return acc - pred.amount;
      }
    }, 0);
  }

  // Calculate reputation score (0-100)
  static calculateReputationScore(
    brierScore: number,
    accuracy: number,
    totalVolume: number,
    consistency: number
  ): number {
    const brierComponent = (1 - brierScore) * 30; // 30 points max
    const accuracyComponent = (accuracy / 100) * 40; // 40 points max
    const volumeComponent = Math.min(totalVolume / 10000, 1) * 20; // 20 points max
    const consistencyComponent = consistency * 10; // 10 points max
    
    return Math.round(brierComponent + accuracyComponent + volumeComponent + consistencyComponent);
  }

  // Detect gaming/sybil behavior
  static detectGaming(predictions: Prediction[]): {
    isSuspicious: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    
    // Check for only betting on easy markets
    const avgConfidence = predictions.reduce((acc, p) => acc + Math.abs(p.prediction - 0.5), 0) / predictions.length;
    if (avgConfidence > 0.4) {
      reasons.push('Only betting on obvious outcomes');
    }
    
    // Check for low volume per trade (dust attacks)
    const avgAmount = predictions.reduce((acc, p) => acc + p.amount, 0) / predictions.length;
    if (avgAmount < 1 && predictions.length > 50) {
      reasons.push('Suspicious low-volume high-frequency pattern');
    }
    
    // Check for perfect accuracy (too good to be true)
    const accuracy = this.calculateAccuracy(predictions);
    if (accuracy === 100 && predictions.length > 20) {
      reasons.push('Unrealistic perfect accuracy');
    }
    
    return {
      isSuspicious: reasons.length > 0,
      reasons
    };
  }
}