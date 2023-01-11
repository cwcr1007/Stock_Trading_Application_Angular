import { Auto } from '../interface/auto';
import { StockService } from './../stock.service';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {

  AllCompanies: Auto[] = [];
  isLoading = false;
  myControl = new FormControl();
  value = {} as string;
  ifValid = true;
  
  constructor(
    private router: Router,
    private stockservice: StockService
  ) { }

  ngOnInit(): void {
    this.myControl.valueChanges.pipe(
      debounceTime(400)).subscribe(
        (value) => this.getFilteredAuto(value)
      );
  }

  getFilteredAuto(value: string) {
    this.isLoading = true;
    if (value === '') {
      this.AllCompanies = [];
      return;
    }
    this.stockservice.getAuto(value).
    subscribe((companies) => (
      this.isLoading = false,
      this.AllCompanies = companies));
  }

  onSubmit(inputValue: string) {
    if(inputValue == '' || inputValue == null){
      this.value = inputValue;
      this.ifValid = false;
    }else{
      this.router.navigate([`search/${inputValue}`]);
      this.ifValid = true;
    }
  }

}
