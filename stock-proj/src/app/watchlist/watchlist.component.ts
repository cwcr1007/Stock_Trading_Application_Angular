import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  watchArray = []
  _success = new Subject<string>();
  successMessage = '';
  alertType!: string;
  @ViewChild('selfClosingAlert', { static: false })
  selfClosingAlert!: NgbAlert;


  constructor(private router: Router) { }

  ngOnInit(): void {
    this.watchArray = JSON.parse(localStorage.getItem('watchlist') || '[]');
    this._success.subscribe(message => this.successMessage = message);
    this._success.pipe(debounceTime(5000)).subscribe(() => {
      if (this.selfClosingAlert) {
        this.selfClosingAlert.close();
      }
    });
  }

  onClick(inputValue: string) {
    this.router.navigate([`search/${inputValue}`]);
  }

  removeWatchItem(num: number, ticker: string){
    this.watchArray.splice(num, 1);
    let newArray = this.watchArray.filter(
      (data: { ticker: string; }) => data.ticker != ticker.toUpperCase()
    );
    localStorage.setItem('watchlist', JSON.stringify(newArray)); 

    this._success.next(`${ticker.toUpperCase()} removed from Watchlist.`); 
  }

}
