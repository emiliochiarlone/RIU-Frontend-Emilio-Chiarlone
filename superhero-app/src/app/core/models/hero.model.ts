export class Hero {
  static currentId = 1;

  private _id: number;
  constructor(
    private _name: string,
  ) {
    this._id = Hero.currentId++;
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

  set id(newId: number) {
    this._id = newId;
  }

  toString(): string {
    return `Hero ${this.id}: ${this.name}`;
  }
}
