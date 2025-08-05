import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _isLoading = signal(false);
  private activeRequests = signal(0);

  readonly isLoading = this._isLoading.asReadonly();

  startLoading(): void {
    this.activeRequests.update(count => count + 1);
    if (this.activeRequests() === 1) {
      this._isLoading.set(true);
    }
  }

  stopLoading(): void {
    this.activeRequests.update(count => Math.max(0, count - 1));
    if (this.activeRequests() === 0) {
      this._isLoading.set(false);
    }
  }
}
