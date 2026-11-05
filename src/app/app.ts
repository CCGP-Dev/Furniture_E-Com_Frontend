import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnnouncementBar } from './layout/announcement-bar/announcement-bar';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AnnouncementBar, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
