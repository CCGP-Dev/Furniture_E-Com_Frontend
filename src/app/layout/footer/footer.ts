import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  subscribed = signal(false);

  onSubscribe(event: Event, email: HTMLInputElement) {
    event.preventDefault();
    if (!email.value.trim() || !email.checkValidity()) {
      email.reportValidity();
      return;
    }
    this.subscribed.set(true);
    email.value = '';
  }
    year = new Date().getFullYear();
}
