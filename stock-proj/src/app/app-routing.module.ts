import { PortfolioComponent } from './portfolio/portfolio.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { DetailGeneralComponent } from './detail-general/detail-general.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildActivationEnd, RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  { path: '', redirectTo: 'search/home', pathMatch: 'full'},
  //{ path: 'search', component: SearchBarComponent, children:[{path: 'search/home', children:[]}, {path: 'search/:ticker', component:DetailGeneralComponent}]},
  { path: 'search/home', component: SearchBarComponent },
  { path: 'search/:ticker', component: DetailGeneralComponent },
  { path: 'watchlist', component: WatchlistComponent },
  { path: 'portfolio', component: PortfolioComponent }
];


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
