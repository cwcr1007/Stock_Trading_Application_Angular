import { RecommendType } from './../interface/recommend-type';
import { EarningType } from './../interface/earning-type';
import { SocialType } from './../interface/social-type';
import { NewsType } from './../interface/news-type';
import { HistoryType } from './../interface/history-type';
import { PriceType } from './../interface/price-type';
import { DescripType } from './../interface/descrip-type';
import { Component, OnInit, ViewChild } from '@angular/core';
import { StockService } from './../stock.service';
import { ActivatedRoute, NavigationEnd } from '@angular/router';
import { RouterModule, Router } from '@angular/router';
import * as Highcharts from 'highcharts/highstock';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { TransactionComponent } from '../transaction/transaction.component';
declare var require: any;
require('highcharts/indicators/indicators')(Highcharts); // loads core and enables sma
require('highcharts/indicators/volume-by-price')(Highcharts); // loads enables vbp

@Component({
  selector: 'app-detail-general',
  templateUrl: './detail-general.component.html',
  styleUrls: ['./detail-general.component.css'],
  providers: [NgbModalConfig, NgbModal]
})
export class DetailGeneralComponent implements OnInit {
  //@Output() newItemEvent = new EventEmitter<NewsType>();

  ticker: any;
  description = {} as DescripType;
  price = {} as PriceType;
  peer: string[] = [];
  smallHistory = {} as HistoryType;
  largeHistory = {} as HistoryType;
  news: NewsType[] = [];
  newsPage = {} as NewsType;
  social = {} as SocialType;
  earning: EarningType[] = [];
  recommend: RecommendType[] = [];

  isLoading = false;
  currentTime: number = Date.now();
  isOpen = false;
  isIncrease = true;
  endTime = 0;
  lineColor = "";
  isSaved = false;
  isBought = false;

  Highcharts: typeof Highcharts = Highcharts; // required
  chartConstructor: string = 'stockChart'; // optional string, defaults to 'chart'
  chartOptions!: Highcharts.Options; // required
  largeChartOptions!: Highcharts.Options; // required
  normalConstructor: string = 'chart'; // optional string, defaults to 'chart'
  updateFlag: boolean = false; // optional boolean
  recommandChartOptions!: Highcharts.Options;
  surpriseChartOptions!: Highcharts.Options;

  _success = new Subject<string>();
  successMessage = '';
  alertType!: string;

  @ViewChild('selfClosingAlert', { static: false })
  selfClosingAlert!: NgbAlert;

  constructor(
    private stockservice: StockService,
    private route: ActivatedRoute,
    private router: Router,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private transactionService: NgbModal
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.ticker = params.get('ticker');
      //console.log('ticker name in details: ' + this.ticker);
      this.isLoading = true;
      this._success.subscribe(message => this.successMessage = message);
      this._success.pipe(debounceTime(5000)).subscribe(() => {
        if (this.selfClosingAlert) {
          this.selfClosingAlert.close();
        }
      });
      this.ticker = this.route.snapshot.params['ticker'];
      this.isInPortfolio();
      this.isInWatchlist();
      this.descriptionHelper();
      this.priceHelper();
      this.peerHelper();
      this.newsHelper();
      this.recommendHelper();
      this.earningHelper();
    });

    this.isLoading = true;
    this._success.subscribe(message => this.successMessage = message);
    this._success.pipe(debounceTime(5000)).subscribe(() => {
      if (this.selfClosingAlert) {
        this.selfClosingAlert.close();
      }
    });
    this.ticker = this.route.snapshot.params['ticker'];
    this.isInPortfolio();
    this.isInWatchlist();
    this.descriptionHelper();
    this.priceHelper();
    this.peerHelper();
    this.newsHelper();
    this.recommendHelper();
    this.earningHelper();
  }

  goTransaction(ifBuy: boolean) {
    const modalRef = this.transactionService.open(TransactionComponent);
    modalRef.componentInstance.ticker = this.ticker.toUpperCase();
    modalRef.componentInstance.currentPrice = this.price.c;
    modalRef.componentInstance.name = this.description.name;
    modalRef.componentInstance.ifBuy = ifBuy;
    modalRef.componentInstance.isBought = this.isBought;
    modalRef.result.then((data) => {
      if(data){
        this._success.next(`${(this.description.ticker)} bought successfully.`);
        this.alertType = "success";
      }else{
        this._success.next(`${this.description.ticker} sold successfully. `);
        this.alertType = "danger";
      }
      this.isInPortfolio();
    });
    // pass back if use buy or sell the stock => show the alert!!
  }

  isInPortfolio() {
    let portfolioArray = JSON.parse(localStorage.getItem('portfolio') || '[]');
    let data =  portfolioArray.filter(
      (a: { ticker: string; }) => a != null && a.ticker === this.ticker.toUpperCase()
    );
    if (data.length) {
      this.isBought = true;
    } else {
      this.isBought = false;
    }
  }

  isInWatchlist() {
    let watchArray = JSON.parse(localStorage.getItem('watchlist') || '[]');
    let data = watchArray.filter(
      (data: { ticker: string; }) => data.ticker === this.ticker.toUpperCase()
    );
    if (data.length) {
      this.isSaved = true;
    } else {
      this.isSaved = false;
    }
  }

  public saveStock() {
    let watchArray = JSON.parse(localStorage.getItem('watchlist') || '[]');

    if (this.isSaved == false) {
      this.alertType = "success";
      this._success.next(`${this.ticker.toUpperCase()} added to Watchlist.`);
      let newItem = {
        ticker: this.ticker.toUpperCase(),
        name: this.description.name,
        price: this.price.c,
        change: this.price.d,
        percent: this.price.dp,
        isIncrease: this.isIncrease
      };
      watchArray.push(newItem);
      localStorage.setItem('watchlist', JSON.stringify(watchArray));
    } else {
      this.alertType = "danger";
      let newArray = watchArray.filter(
        (data: { ticker: string; }) => data.ticker != this.ticker.toUpperCase()
      );
      localStorage.setItem('watchlist', JSON.stringify(newArray));
      this._success.next(`${this.ticker.toUpperCase()} removed from Watchlist.`);
    }
    this.isSaved = !this.isSaved;
  }

  descriptionHelper() {
    this.stockservice.getDescription(this.ticker)
      .subscribe((data) => (
        this.description = data,
        this.socialHelper()
      ));
  }

  priceHelper() {
    //localStorage.clear();
    this.stockservice.getPrice(this.ticker)
      .subscribe((data) => (
        this.price = data,
        this.isOpen = (this.currentTime - this.price.t) / 1000 < 60,
        this.isIncrease = this.price.d >= 0 ? true : false,
        this.endTime = this.isOpen ? this.currentTime : this.price.t,
        this.lineColor = this.price.d > 0 ? "green" : "red",
        this.isLoading = false,
        this.smallChartHelper(),
        this.largeChartHelper()
      ));
  }

  peerHelper() {
    this.stockservice.getPeer(this.ticker)
      .subscribe((data) => (
        this.peer = data
      ));
  }

  smallChartHelper() {
    let startTime = this.endTime - 3600 * 6;
    this.stockservice.getHistory(this.ticker, "5", this.endTime, startTime)
      .subscribe((data) => (
        this.smallHistory = data,
        this.displaySmallChart()
      ))
  }

  displaySmallChart() {
    let dataPair = [];
    for (let i = 0; i < this.smallHistory.t.length; i++) {
      dataPair.push([
        (this.smallHistory.t[i] - 3600 * 7) * 1000,
        this.smallHistory.c[i]
      ])
    }
    this.chartOptions = {
      title: {
        text: this.ticker.toUpperCase() + " Hourly price Variation",
        style: {
          color: "grey"
        }
      },
      navigator: {
        enabled: false
      },
      rangeSelector: {
        enabled: false
      },
      series: [{
        name: this.ticker.toUpperCase(),
        data: dataPair,
        type: "line",
        color: this.lineColor,
        tooltip: {
          valueDecimals: 2
        },
      }]
    };
  }

  newsHelper() {
    let today = new Date();
    let to = today.getFullYear() + "-" +
      (today.getMonth() < 9 ? "0" : "") + (today.getMonth() + 1) + "-" +
      (today.getDate() < 10 ? "0" : "") + today.getDate();

    today.setDate(today.getDate() - 6);
    let from = today.getFullYear() + "-" +
      (today.getMonth() < 9 ? "0" : "") + (today.getMonth() + 1) + "-" +
      (today.getDate() < 10 ? "0" : "") + today.getDate();

    this.stockservice.getNews(this.ticker, from, to)
      .subscribe((data) => (
        this.news = data
      ));
  }

  newsDetail(news: NewsType, content: any) {
    this.newsPage = news;
    this.modalService.open(content);
  }


  largeChartHelper() {
    let startTime = this.endTime - 31536000 * 2;
    this.stockservice.getHistory(this.ticker, "D", this.endTime, startTime)
      .subscribe((data) => (
        this.largeHistory = data,
        this.displayLargeChart()
      ))
  }

  displayLargeChart() {
    let ohlc = [];
    let volume = [];

    for (let i = 0; i < this.largeHistory.t.length; i++) {
      ohlc.push([
        (this.largeHistory.t[i] - 3600 * 7) * 1000,
        this.largeHistory.o[i],
        this.largeHistory.h[i],
        this.largeHistory.l[i],
        this.largeHistory.c[i]
      ]);

      volume.push([
        (this.largeHistory.t[i] - 3600 * 7) * 1000,
        this.largeHistory.v[i],
      ]);
    }

    // create the chart
    this.largeChartOptions = {

      rangeSelector: {
        selected: 2
      },

      title: {
        text: this.ticker.toUpperCase() + " Historical",
      },
      subtitle: {
        text: 'With SMA and Volume by Price technical indicators'
      },

      yAxis: [{
        startOnTick: false,
        endOnTick: false,
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'OHLC'
        },
        height: '60%',
        lineWidth: 2,
        resize: {
          enabled: true
        }
      }, {
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'Volume'
        },
        top: '65%',
        height: '35%',
        offset: 0,
        lineWidth: 2
      }],

      tooltip: {
        split: true
      },

      // plotOptions: {
      //   series: {
      //     dataGrouping: {
      //       units: groupingUnits
      //     }
      //   }
      // },

      series: [{
        type: 'candlestick',
        name: this.ticker.toUpperCase(),
        id: this.ticker,
        zIndex: 2,
        data: ohlc
      }, {
        type: 'column',
        name: 'Volume',
        id: 'volume',
        data: volume,
        yAxis: 1
      }, {
        type: 'vbp',
        linkedTo: this.ticker,
        params: {
          volumeSeriesID: 'volume'
        },
        dataLabels: {
          enabled: false
        },
        zoneLines: {
          enabled: false
        }
      }, {
        type: 'sma',
        linkedTo: this.ticker,
        zIndex: 1,
        marker: {
          enabled: false
        }
      }]
    };

  }

  socialHelper() {
    this.stockservice.getSocial(this.ticker)
      .subscribe((data) => (
        this.social = data
      ))
  }

  earningHelper() {
    this.stockservice.getEarning(this.ticker)
      .subscribe((data) => (
        this.earning = data,
        this.displaySurpriseChart()
      ))
  }

  displaySurpriseChart() {
    let actual = [];
    let estimate = [];
    let period = [];
    for (let i = 0; i < this.earning.length; i++) {
      actual.push(this.earning[i].actual);
      estimate.push(this.earning[i].estimate);
      period.push(this.earning[i].period + '<br>' + "Surprise: " + this.earning[i].surprise);
    }

    this.surpriseChartOptions = {
      chart: {
        type: 'spline',
        inverted: false
      },
      title: {
        text: 'Historical EPS Surprise'
      },
      xAxis: [{
        categories: period
      }],
      yAxis: {
        title: {
          text: 'Quarterly EPS'
        }
      },
      legend: {
        enabled: true
      },
      tooltip: {
        shared: true
      },

      series: [{
        name: 'Actual',
        type: 'spline',
        data: actual
      }, {
        name: 'Estimate',
        type: 'spline',
        data: estimate
      }]
    };
  }

  recommendHelper() {
    this.stockservice.getRecommendation(this.ticker)
      .subscribe((data) => (
        this.recommend = data,
        this.displayRecommendChart()
      ))
  }

  displayRecommendChart() {
    let strBuy = [];
    let buy = [];
    let hold = [];
    let sell = [];
    let strSell = [];
    let period = [];
    for (let i = 0; i < this.recommend.length; i++) {
      strBuy.push(this.recommend[i].strongBuy);
      buy.push(this.recommend[i].buy);
      hold.push(this.recommend[i].hold);
      sell.push(this.recommend[i].sell);
      strSell.push(this.recommend[i].strongSell);
      period.push(this.recommend[i].period.substring(0, 7));
    }

    this.recommandChartOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Recommendation Trends'
      },
      navigator: {
        enabled: false
      },
      rangeSelector: {
        enabled: false
      },
      xAxis: {
        categories: period
      },
      yAxis: {
        min: 0,
        title: {
          text: '#Analysis'
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: 'gray'
          }
        }
      },

      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true
          }
        }
      },
      series: [{
        name: 'Strong Buy',
        type: 'column',
        data: strBuy,
        color: 'DarkOliveGreen'
      }, {
        name: 'Buy',
        type: 'column',
        data: buy,
        color: 'green'
      }, {
        name: 'Hold',
        type: 'column',
        data: hold,
        color: 'DarkGoldenRod'
      }, {
        name: 'Sell',
        type: 'column',
        data: sell,
        color: 'DarkSalmon'
      }, {
        name: 'Strong Sell',
        type: 'column',
        data: strSell,
        color: 'DarkRed'
      }]
    }
  }

}
