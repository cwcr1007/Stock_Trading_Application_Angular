import { EarningType } from './interface/earning-type';
import { SocialType } from './interface/social-type';
import { RecommendType } from './interface/recommend-type';
import { NewsType } from './interface/news-type';
import { HistoryType } from './interface/history-type';
import { DescripType } from './interface/descrip-type';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Auto } from './interface/auto';
import { PriceType } from './interface/price-type';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private http: HttpClient) { }

  rootURL = "/api/"

  getAuto(input: string){
    let url = `${this.rootURL}auto/${input}`;
    return this.http.get<Auto[]>(url);
  }

  getDescription(ticker: string){
    let url = `${this.rootURL}description/${ticker}`;
    let des = this.http.get<DescripType>(url);
    return des;
  }

  getPrice(ticker: string): Observable<PriceType>{
    let url = `${this.rootURL}price/${ticker}`;
    return this.http.get<PriceType>(url);
  }

  getPeer(ticker: string): Observable<string[]>{
    let url = `${this.rootURL}peer/${ticker}`;
    return this.http.get<string[]>(url);
  }

  getHistory(ticker:string, resolution:string, to:number, from:number): Observable<HistoryType>{
    let url = `${this.rootURL}history/${ticker}/${resolution}/${from}&${to}`;
    return this.http.get<HistoryType>(url);
  }

  getNews(ticker:string, from:string, to:string): Observable<NewsType[]>{
    let url = `${this.rootURL}news/${ticker}/${from}&${to}`;
    return this.http.get<NewsType[]>(url);
  }

  getSocial(ticker:string): Observable<SocialType>{
    let from = "2022-01-01";
    let url = `${this.rootURL}social/${ticker}/${from}`;
    return this.http.get<SocialType>(url);
  }

  getEarning(ticker:string): Observable<EarningType[]>{
    let url = `${this.rootURL}earnings/${ticker}`;
    return this.http.get<EarningType[]>(url);
  }

  getRecommendation(ticker:string): Observable<RecommendType[]>{
    let url = `${this.rootURL}recommendation/${ticker}`;
    return this.http.get<RecommendType[]>(url);
  }



}
