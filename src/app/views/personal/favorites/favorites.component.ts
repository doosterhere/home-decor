import {Component, OnDestroy, OnInit} from '@angular/core';
import {FavoritesService} from "../../../shared/services/favorites.service";
import {FavoritesType} from "../../../../types/favorites.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarErrorUtil} from "../../../shared/utils/snackbar-error.util";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit, OnDestroy {
  products: FavoritesType[] = [];
  favoriteServiceGetFavoritesSubscription: Subscription | null = null;

  constructor(private favoriteService: FavoritesService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.favoriteServiceGetFavoritesSubscription = this.favoriteService.getFavorites()
      .subscribe((data: FavoritesType[] | DefaultResponseType) => {
        SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError(data as DefaultResponseType, this._snackBar);
        this.products = (data as FavoritesType[]);
      });

    this.favoriteService.isListOfFavoritesUpdated$.subscribe((id: string) => {
      this.products = this.products.filter(item => item.id != id);
    });
  }

  ngOnDestroy(): void {
    this.favoriteServiceGetFavoritesSubscription?.unsubscribe();
  }
}
