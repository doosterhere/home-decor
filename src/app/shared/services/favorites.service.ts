import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {FavoritesType} from "../../../types/favorites.type";
import {DefaultResponseType} from "../../../types/default-response.type";

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  isListOfFavoritesUpdated$: Subject<string> = new Subject<string>();

  constructor(private httpClient: HttpClient) {
  }

  getFavorites(): Observable<FavoritesType[] | DefaultResponseType> {
    return this.httpClient.get<FavoritesType[] | DefaultResponseType>(environment.api + 'favorites');
  }

  removeFromFavorites(productId: string): Observable<DefaultResponseType> {
    return this.httpClient.delete<DefaultResponseType>(environment.api + 'favorites', {
      body: {
        productId: productId
      }
    });
  }

  addToFavorites(productId: string): Observable<DefaultResponseType | FavoritesType> {
    return this.httpClient.post<DefaultResponseType | FavoritesType>(environment.api + 'favorites', {productId});
  }
}
