import {AuthService} from "../../core/auth/auth.service";
import {ProductType} from "../../../types/product.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DefaultResponseType} from "../../../types/default-response.type";
import {FavoritesType} from "../../../types/favorites.type";
import {FavoritesService} from "../services/favorites.service";

export class FavoritesUtil {

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
