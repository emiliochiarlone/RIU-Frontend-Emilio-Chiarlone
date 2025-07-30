export class Hero {
  static currentId = 1;

  constructor(
    private _name: string,
    private _id?: number
  ) {
    this._id = _id !== undefined ? _id : Hero.currentId++;
    this._name = _name;
  }

  set name(newName: string) {
    this._name = newName;
  }

  get name(): string {
    return this._name;
  }

  get id(): number {
    return this._id || 0;
  }

  toString(): string {
    return `Hero ${this.id}: ${this.name}`;
  }
}
