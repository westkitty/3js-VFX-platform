import { AbilityInstance } from './AbilityInstance';

export class RuntimeSet {
  private instances: AbilityInstance[] = [];

  public add(instance: AbilityInstance): void { this.instances.push(instance); }
  public remove(instance: AbilityInstance): void { this.instances = this.instances.filter((candidate) => candidate !== instance); }

  public update(dt: number, time: number, retained?: AbilityInstance | null): void {
    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      const isDone = instance.update(dt, time);
      if (isDone && instance !== retained) {
        this.instances.splice(i, 1);
        i--;
      }
    }
  }

  public getActiveCount(): number { return this.instances.filter((instance) => instance.phase !== 'done').length; }
  public getTotalParticleCount(): number { return this.instances.reduce((sum, instance) => sum + instance.getParticleCount(), 0); }
  public clear(): void { this.instances.forEach((instance) => instance.destroy()); this.instances = []; }
}
