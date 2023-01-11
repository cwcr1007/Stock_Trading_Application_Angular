import { PortfolioType } from './../interface/portfolio-type';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PriceType } from '../interface/price-type';
import { TransactionComponent } from '../transaction/transaction.component';
import { StockService } from './../stock.service';
import { debounceTime } from 'rxjs/operators';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  mystockArr: PortfolioType[] = [];
  item = {} as PortfolioType;
  cash = 25000;
  price = {} as PriceType;
  map: Map<string, number> = new Map();
  tolerance = 0.001;

  _success = new Subject<string>();
  successMessage = '';
  alertType!: string;
  @ViewChild('selfClosingAlert', { static: false })
  selfClosingAlert!: NgbAlert;

  constructor(
    private stockservice: StockService,
    private transactionService: NgbModal
  ) { }

  ngOnInit(): void {
    this.getStorageInfo();
    this._success.subscribe(message => this.successMessage = message);
    this._success.pipe(debounceTime(5000)).subscribe(() => {
      if (this.selfClosingAlert) {
        this.selfClosingAlert.close();
      }
    });
  }

  getStorageInfo() {
    this.cash = Number(JSON.parse(localStorage.getItem('cash') || '25000'));
    this.mystockArr = JSON.parse(localStorage.getItem('portfolio') || '[]');
    this.editStock(this.mystockArr);
  }

  editStock = (mystockArr: PortfolioType[]) => {
    return mystockArr.map(item => {
      var temp = Object.assign({}, item);
      this.priceHelper(item.ticker);
    });
  }

  priceHelper(ticker: string) {
    this.stockservice.getPrice(ticker)
      .subscribe((data) => (
        this.price = data,
        this.map.set(ticker, this.price.c)
      ));
  }

  goTransaction(item: PortfolioType, ifBuy: boolean) {
    const modalRef = this.transactionService.open(TransactionComponent);
    modalRef.componentInstance.ticker = item.ticker;
    modalRef.componentInstance.currentPrice = this.map.get(item.ticker);
    modalRef.componentInstance.name = item.name;
    modalRef.componentInstance.ifBuy = ifBuy;
    modalRef.componentInstance.isBought = true;
    modalRef.result.then((data) => {
      this.getStorageInfo();
      this._success.subscribe(message => this.successMessage = message);
      this._success.pipe(debounceTime(5000)).subscribe(() => {
        if (this.selfClosingAlert) {
          this.selfClosingAlert.close();
        }
      });
      if (data) {
        this._success.next(`Bought successfully.`);
        this.alertType = "success";
      } else {
        this._success.next(`Sold successfully. `);
        this.alertType = "danger";
      }
    });

  }

}
