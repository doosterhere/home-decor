import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {ProductType} from "../../../types/product.type";
import {ActiveParamsType} from "../../../types/active-params.type";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private httpClient: HttpClient) {
  }

  getBestProducts(): Observable<ProductType[]> {
    return this.httpClient.get<ProductType[]>(environment.api + 'products/best');
  }

  getProducts(params: ActiveParamsType): Observable<{ totalCount: number, pages: number, items: ProductType[] }> {
    return this.httpClient.get<{ totalCount: number, pages: number, items: ProductType[] }>(environment.api + 'products', {
      params: params
    });
  }

  getProduct(url: string): Observable<ProductType> {
    return this.httpClient.get<ProductType>(environment.api + 'products/' + url);
  }

  searchProducts(searchPhrase: string): Observable<ProductType[]> {
    return this.httpClient.get<ProductType[]>(environment.api + 'products/search?query=' + searchPhrase);
  }
}
