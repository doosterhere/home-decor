import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from "rxjs";

import { LoaderService } from "../../services/loader.service";

@Component( {
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
} )
export class LoaderComponent implements OnInit, OnDestroy {
  isShowed: boolean = false;
  loaderServiceIsShowed$Subscription: Subscription | null = null;

  constructor(private loaderService: LoaderService) {
  }

  ngOnInit(): void {
    this.loaderServiceIsShowed$Subscription = this.loaderService.isShowed$
      .subscribe( (isShowed: boolean) => {
        this.isShowed = isShowed;
      } );
  }

  ngOnDestroy(): void {
    this.loaderServiceIsShowed$Subscription?.unsubscribe();
  }
}
