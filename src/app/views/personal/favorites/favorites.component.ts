import {Component, OnInit} from '@angular/core';
import {FavoritesService} from "../../../shared/services/favorites.service";
import {FavoritesType} from "../../../../types/favorites.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  products: FavoritesType[] = [];
  serverStaticPath: string = environment.serverStaticPath;

  constructor(private favoriteService: FavoritesService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.favoriteService.getFavorites().subscribe((data: FavoritesType[] | DefaultResponseType) => {
      if ((data as DefaultResponseType).error) {
        const message = (data as DefaultResponseType).message;
        this._snackBar.open(message);
        throw new Error(message);
      }

      this.products = data as FavoritesType[];
    });
  }

  removeFromFavorites(productId: string): void {
    this.favoriteService.removeFromFavorites(productId).subscribe((data: DefaultResponseType) => {
      if (data.error) {
        this._snackBar.open(data.message);
        throw new Error(data.message);
      }

      this.products = this.products.filter(item => item.id !== productId);
      this._snackBar.open(data.message);
    });
  }
}
