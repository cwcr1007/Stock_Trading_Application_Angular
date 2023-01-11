import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  a: string = "nav-link active";
  b: string = "nav-link";
  c: string = "nav-link";
  navbarCollapsed = true


  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  goHome() {
    this.router.navigate(['search/home']);
    this.a = "nav-link active";
    this.b = "nav-link";
    this.c = "nav-link";
  }

  goToWatchlist() {
    this.router.navigate(['watchlist']);
    this.a = "nav-link";
    this.b = "nav-link active";
    this.c = "nav-link";
  }

  goToPortfolio() {
    this.router.navigate(['portfolio']);
    this.a = "nav-link";
    this.b = "nav-link";
    this.c = "nav-link active";
  }


}
