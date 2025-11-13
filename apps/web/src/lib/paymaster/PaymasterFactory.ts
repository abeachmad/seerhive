import { IPaymaster } from './IPaymaster';
import { PimlicoPaymaster } from './PimlicoPaymaster';
import { ParticlePaymaster } from './ParticlePaymaster';

type PaymasterProvider = 'pimlico' | 'particle';

export class PaymasterFactory {
  private static instance: IPaymaster | null = null;

  static getPaymaster(): IPaymaster {
    if (this.instance) {
      return this.instance;
    }

    const provider = (process.env.NEXT_PUBLIC_PAYMASTER_PROVIDER || 'pimlico') as PaymasterProvider;

    switch (provider) {
      case 'particle':
        this.instance = new ParticlePaymaster();
        break;
      case 'pimlico':
      default:
        this.instance = new PimlicoPaymaster();
        break;
    }

    return this.instance;
  }

  static resetInstance() {
    this.instance = null;
  }
}