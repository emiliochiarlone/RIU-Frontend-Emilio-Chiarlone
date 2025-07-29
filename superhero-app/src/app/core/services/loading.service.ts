import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private requestCount = 0;
  private _loading = signal(false);

  constructor() { }

  get loading() {
    return this._loading;
  }

  startLoading() {
    this.requestCount++;
    this._loading.set(true);
  }

  stopLoading() {
    this.requestCount--;
    if (this.requestCount === 0) {
      this._loading.set(false);
    }
  }
}
