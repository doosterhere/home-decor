import {Injectable} from '@angular/core';
import {Observable, Subject, tap} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {CartType} from "../../../types/cart.type";
import {DefaultResponseType} from "../../../types/default-response.type";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  count: number = 0;
  count$: Subject<number> = new Subject<number>();

  constructor(private httpClient: HttpClient) {
  }

  getCart(): Observable<CartType> {
    return this.httpClient.get<CartType>(environment.api + 'cart', {withCredentials: true});
  }

  updateCart(productId: string, quantity: number): Observable<CartType | DefaultResponseType> {
    return this.httpClient.post<CartType | DefaultResponseType>(environment.api + 'cart', {
      productId,
      quantity
    }, {withCredentials: true})
      .pipe(
        tap(data => {
          this.count = 0;

          (data as CartType).items.forEach(item => {
            this.count += item.quantity;
          });

          this.count$.next(this.count);
        })
      );
  }

  getCartCount(): Observable<{ count: number }> {
    return this.httpClient.get<{ count: number }>(environment.api + 'cart/count', {withCredentials: true})
      .pipe(
        tap(data => {
          this.count = data.count;
          this.count$.next(this.count);
        })
      );
  }
}
