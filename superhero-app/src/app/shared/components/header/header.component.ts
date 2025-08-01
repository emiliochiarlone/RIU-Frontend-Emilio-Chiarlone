import { Component, inject, signal } from '@angular/core';
import { Event, NavigationEnd, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '@shared/material/material.module';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [MaterialModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  router = inject(Router);
  title = 'Hero Manager';
  githubUrl =
    'https://github.com/emiliochiarlone/RIU-Frontend-Emilio-Chiarlone';
  linkedinUrl = 'https://www.linkedin.com/in/emilio-chiarlone-7ba74a123';

  currentRouteTitle = signal<string>('');
  subscriptions: Subscription[] = [];

  constructor() {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.router.events.pipe(
        filter((event: Event) => event instanceof NavigationEnd),
      ).subscribe(
        () => this.currentRouteTitle.set(
          this.router.routerState.snapshot.root.firstChild?.data['title'] || ''
        )
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  onLogoClick(): void {
    this.router.navigate(['/']);
  }

}
