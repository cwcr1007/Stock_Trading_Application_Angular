import { PortfolioComponent } from './../portfolio/portfolio.component';
import { PortfolioType } from './../interface/portfolio-type';
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'highcharts';



@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  @Input() ticker = {} as string;
  @Input() currentPrice = {} as number;
  @Input() ifBuy = {} as boolean;
  @Input() name = {} as string;
  cash = {} as number;
  quantity = 0;
  mystockArr: PortfolioType[] = [];
  stock = {} as PortfolioType;


  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.cash = Number(JSON.parse(localStorage.getItem('cash') || '25000'));
    this.mystockArr = JSON.parse(localStorage.getItem('portfolio') || '[]');

    let arr = this.mystockArr.filter(
      (data: { ticker: string; }) => data.ticker === this.ticker
    );
    //this.stock = arr.length > 0 ? arr[0] : {ticker: this.ticker, quantity: 0, totalCost: 0, name: this.name}
    if (arr.length == 0) {
      this.stock = { ticker: this.ticker, quantity: 0, totalCost: 0, name: this.name };
      this.mystockArr.push(this.stock);
    } else {
      this.stock = arr[0];
    }
  }

  setData() {
    let addedStockArr = this.editStock(this.mystockArr, this.quantity, this.quantity * this.currentPrice, this.ticker, this.ifBuy);
    let newStockArr = this.removeEmptyStock(addedStockArr);
    localStorage.setItem("portfolio", JSON.stringify(newStockArr));

    if (this.ifBuy) {
      this.activeModal.close(true);
      this.cash -= this.quantity * this.currentPrice;
      localStorage.setItem("cash", JSON.stringify(this.cash));
    } else { // sell
      this.activeModal.close(false);
      this.cash += this.quantity * this.currentPrice;
      localStorage.setItem("cash", JSON.stringify(this.cash));
    }
  }

  removeEmptyStock = (mystockArr: PortfolioType[]) => {
    return mystockArr.filter(
      (data: { quantity: number; }) => data.quantity !== 0
    )
  }

  editStock = (mystockArr: PortfolioType[], quantity: number, totalCost: number, ticker: string, ifBuy: boolean) => {
    return mystockArr.map(item => {
      var temp = Object.assign({}, item);
      if (temp.ticker === ticker) {
        if (ifBuy) {
          temp.quantity += quantity;
          temp.totalCost += totalCost;
        } else {
          temp.quantity -= quantity;
          if(temp.quantity == 0){

          }
          temp.totalCost -= totalCost;
        }
      }
      return temp;
    });
  }
}
