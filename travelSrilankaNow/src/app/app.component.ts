import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'travelSrilankaNow';
  isAdminRoute = false;

  constructor(private router: Router, private seo: SeoService) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute = event.url.startsWith('/admin');
      this.applyRouteSeo();
    });

    // Check initial route
    this.isAdminRoute = this.router.url.startsWith('/admin');
  }

  /** Default meta for routes declaring data.seo; detail pages override once their data loads. */
  private applyRouteSeo(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) { route = route.firstChild; }
    const cfg = route.data && route.data.seo;
    if (cfg) {
      const path = this.router.url.split(/[?#]/)[0];
      this.seo.set({ ...cfg, path });
    }
  }
}
