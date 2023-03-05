import {AuthService} from "../../core/auth/auth.service";
import {ProductType} from "../../../types/product.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DefaultResponseType} from "../../../types/default-response.type";
import {FavoritesType} from "../../../types/favorites.type";
import {FavoritesService} from "../services/favorites.service";
import {SnackbarErrorUtil} from "./snackbar-error.util";
import {Subscription} from "rxjs";

export class FavoritesUtil {

  static updateFavorites(authService: AuthService, favoriteService: FavoritesService, product: ProductType, _snackBar: MatSnackBar): Subscription | boolean {
    if (!authService.isLogged) {
      _snackBar.open('Для добавления в избранное необходимо авторизоваться');
      return false;
    }

    if (product.inFavorites) {
      const subscription: Subscription = favoriteService.removeFromFavorites(product.id)
        .subscribe((data: DefaultResponseType) => {
          SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError(data, _snackBar);
          product.inFavorites = false;
          return subscription;
        });
    }

    if (!product.inFavorites) {
      const subscription: Subscription = favoriteService.addToFavorites(product.id).subscribe((data: DefaultResponseType | FavoritesType) => {
        SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError(data as DefaultResponseType, _snackBar);
        product.inFavorites = true;
        return subscription;
      });
    }

    return false;
  }
}
