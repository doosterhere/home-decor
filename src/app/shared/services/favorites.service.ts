import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {FavoritesType} from "../../../types/favorites.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {AuthService} from "../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ProductType} from "../../../types/product.type";

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  constructor(private httpClient: HttpClient,
              private authService: AuthService) {
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

  static updateFavorites(authService: AuthService, favoriteService: FavoritesService, product: ProductType, _snackBar: MatSnackBar): void {
    if (!authService.isLogged) {
      _snackBar.open('Для добавления в избранное необходимо авторизоваться');
      return;
    }

    if (product.inFavorites) {
      favoriteService.removeFromFavorites(product.id).subscribe((data: DefaultResponseType) => {
        if (data.error) {
          _snackBar.open(data.message);
          throw new Error(data.message);
        }

        product.inFavorites = false;
      });
    }

    if (!product.inFavorites) {
      favoriteService.addToFavorites(product.id).subscribe((data: DefaultResponseType | FavoritesType) => {
        if ((data as DefaultResponseType).error) {
          const message = (data as DefaultResponseType).message;
          _snackBar.open((data as DefaultResponseType).message);
          throw new Error(message);
        }

        product.inFavorites = true;
      });
    }
  }
}
