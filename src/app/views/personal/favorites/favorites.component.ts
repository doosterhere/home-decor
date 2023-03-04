import {Component, OnInit} from '@angular/core';
import {FavoritesService} from "../../../shared/services/favorites.service";
import {FavoritesType} from "../../../../types/favorites.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  products: FavoritesType[] = [];

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

      this.products = (data as FavoritesType[]);
    });

    this.favoriteService.isListOfFavoritesUpdated$.subscribe((id: string) => {
      this.products = this.products.filter(item => item.id != id);
    });
  }
}
