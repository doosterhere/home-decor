import {Injectable} from '@angular/core';
import {Observable, Subject, tap} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {DefaultResponseType} from "../../../types/default-response.type";
import {OrderType} from "../../../types/order.type";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private httpClient: HttpClient) {
  }

  createOrder(params: OrderType): Observable<OrderType | DefaultResponseType> {
    return this.httpClient.post<OrderType | DefaultResponseType>(environment.api + 'orders', params, {withCredentials: true});
  }
}
