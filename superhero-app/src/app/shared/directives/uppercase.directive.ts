import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appUppercase]',
  standalone: true
})
export class UppercaseDirective {
  private ref = inject(ElementRef);

  ngAfterViewInit(): void {
    const input = this.ref.nativeElement;
    input.value = input.value.toUpperCase();
  }

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    const input = event.target;
    const value = input.value;
    const uppercaseValue = value.toUpperCase();

    if (value !== uppercaseValue) {
      input.value = uppercaseValue;
      input.dispatchEvent(new Event('input'));
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: any): void {
    const input = event.target;
    input.value = input.value.toUpperCase();
  }
}
