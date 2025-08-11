import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { DialogService } from '@core/services/dialog.service';
import { WelcomeComponent } from '@shared/components/welcome/welcome.component';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let dialogServiceMock: any;

  beforeEach(async () => {
    dialogServiceMock = {
      openDialog: jasmine.createSpy('openDialog').and.returnValue({
        afterClosed: () => of(true),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: DialogService, useValue: dialogServiceMock },
      ],
    }).compileComponents();

    localStorage.removeItem('welcomeShown');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should show welcome dialog if not already shown', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    spyOn(app, 'showWelcomeDialog').and.callThrough();

    app.ngOnInit();

    expect(app.showWelcomeDialog).toHaveBeenCalled();
    expect(dialogServiceMock.openDialog).toHaveBeenCalledWith(WelcomeComponent);
  });

  it('should not show welcome dialog if already shown', () => {
    localStorage.setItem('welcomeShown', 'true');
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    spyOn(app, 'showWelcomeDialog');

    app.ngOnInit();

    expect(app.showWelcomeDialog).not.toHaveBeenCalled();
    expect(dialogServiceMock.openDialog).not.toHaveBeenCalled();
  });

  it('should set welcome as shown and unsubscribe', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.welcomeDialogSubscription = { unsubscribe: jasmine.createSpy('unsubscribe') } as any;

    app.setWelcomeShown();

    expect(localStorage.getItem('welcomeShown')).toBe('true');
    expect(app.welcomeAlreadyShown).toBeTrue();
    expect(app.welcomeDialogSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('showWelcomeDialog should not open dialog if already shown', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.welcomeAlreadyShown = true;

    app.showWelcomeDialog();

    expect(dialogServiceMock.openDialog).not.toHaveBeenCalled();
  });
});