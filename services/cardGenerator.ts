
import { Card } from '../types';

class CardGenerator {
  private totalCards = 500;
  private columnRanges = {
    'B': { min: 1, max: 15 },
    'I': { min: 16, max: 30 },
    'N': { min: 31, max: 45 },
    'G': { min: 46, max: 60 },
    'O': { min: 61, max: 75 }
  };

  private createSeededRNG(seed: number) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  private shuffleArray(array: number[], rng: () => number) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateColumnNumbers(cardNumber: number, colIndex: number, min: number, max: number) {
    const seed = cardNumber * 100 + colIndex;
    const rng = this.createSeededRNG(seed);
    const availableNumbers = [];
    for (let i = min; i <= max; i++) availableNumbers.push(i);
    const shuffled = this.shuffleArray(availableNumbers, rng);
    return shuffled.slice(0, 5).sort((a, b) => a - b);
  }

  public generateCard(cardNumber: number): Card {
    if (cardNumber < 1 || cardNumber > this.totalCards) {
      return this.generateDefaultCard();
    }

    const cardNumbers: number[] = [];
    const columns: (keyof typeof this.columnRanges)[] = ['B', 'I', 'N', 'G', 'O'];
    
    columns.forEach((column, colIndex) => {
      const range = this.columnRanges[column];
      const columnNumbers = this.generateColumnNumbers(cardNumber, colIndex, range.min, range.max);
      cardNumbers.push(...columnNumbers);
    });

    // Center is FREE (represented by 0)
    cardNumbers[12] = 0;

    return {
      id: cardNumber,
      numbers: cardNumbers,
      type: 'Fixed'
    };
  }

  private generateDefaultCard(): Card {
    return {
      id: 0,
      numbers: Array(25).fill(0).map((_, i) => i + 1),
      type: 'Default'
    };
  }
}

export const cardGenerator = new CardGenerator();
