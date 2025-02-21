import type { ComputedValue } from './ComputedValue';
import type { Deps } from './types';

export class ComputedDeps implements Deps {
  public readonly id: string;
  protected snapshot: any;

  constructor(protected readonly body: ComputedValue) {
    this.id = `c-${body.model}-${body.property}`;
  }

  end(): void {
    this.snapshot = this.body.snapshot;
  }

  isDirty(): boolean {
    return this.snapshot !== this.body.value;
  }
}
