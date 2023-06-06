import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { FormBuilder, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { Subscription } from "rxjs";

import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

import { CartService } from "../../../shared/services/cart.service";
import { DefaultResponseType } from "../../../../types/default-response.type";
import { CartType } from "../../../../types/cart.type";
import { CartUtil } from "../../../shared/utils/cart.util";
import { config } from "../../../shared/config/config";
import { DeliveryType } from "../../../../types/delivery.type";
import { PaymentType } from "../../../../types/payment.type";
import { OrderService } from "../../../shared/services/order.service";
import { OrderType } from "../../../../types/order.type";
import { UserService } from "../../../shared/services/user.service";
import { UserInfoType } from "../../../../types/user-info.type";
import { AuthService } from "../../../core/auth/auth.service";
import { SnackbarErrorUtil } from "../../../shared/utils/snackbar-error.util";

@Component( {
  selector: 'order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
} )
export class OrderComponent implements OnInit, OnDestroy {
  cart: CartType | null = null;
  totalAmount: number = 0;
  totalCount: number = 0;
  readonly deliveryCost: number = config.deliveryCost;
  deliveryType: DeliveryType = DeliveryType.delivery;
  deliveryTypes = DeliveryType;
  paymentTypes = PaymentType;
  orderForm = this.fb.group( {
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    fatherName: [''],
    phone: ['', Validators.required],
    paymentType: [PaymentType.cardOnline, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: [''],
    comment: ['']
  } );
  @ViewChild( 'popup' ) popup!: TemplateRef<ElementRef>;
  dialogRef: MatDialogRef<any> | null = null;
  cartServiceGetCartSubscription: Subscription | null = null;
  userServiceGetUserInfoSubscription: Subscription | null = null;
  orderServiceCreateOrderSubscription: Subscription | null = null;

  constructor(private cartService: CartService,
              private router: Router,
              private _snackBar: MatSnackBar,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private orderService: OrderService,
              private userService: UserService,
              private authService: AuthService) {
    this.updateDeliveryTypeValidation();
  }

  ngOnInit(): void {
    this.cartServiceGetCartSubscription = this.cartService.getCart()
      .subscribe( (data: DefaultResponseType | CartType) => {
        if (( data as DefaultResponseType ).error) {
          throw new Error( ( data as DefaultResponseType ).message );
        }

        this.cart = data as CartType;
        if (!this.cart || ( this.cart && !this.cart.items.length )) {
          this._snackBar.open( 'Корзина пустая' );
          this.router.navigate( ['/'] );
          return;
        }

        [this.totalAmount, this.totalCount] = CartUtil.calculateTotal( this.cart );
      } );

    if (this.authService.isLogged) {
      this.userServiceGetUserInfoSubscription = this.userService.getUserInfo()
        .subscribe( (data: UserInfoType | DefaultResponseType) => {
          SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError( data as DefaultResponseType, this._snackBar );

          const userInfo = data as UserInfoType;
          const paramToUpdate = {
            firstName: userInfo.firstName ? userInfo.firstName : '',
            lastName: userInfo.lastName ? userInfo.lastName : '',
            fatherName: userInfo.fatherName ? userInfo.fatherName : '',
            phone: userInfo.phone ? userInfo.phone : '',
            paymentType: userInfo.paymentType ? userInfo.paymentType : PaymentType.cashToCourier,
            email: userInfo.email ? userInfo.email : '',
            street: userInfo.street ? userInfo.street : '',
            house: userInfo.house ? userInfo.house : '',
            entrance: userInfo.entrance ? userInfo.entrance : '',
            apartment: userInfo.apartment ? userInfo.apartment : '',
            comment: ''
          }

          this.orderForm.setValue( paramToUpdate );

          if (userInfo.deliveryType) {
            this.deliveryType = userInfo.deliveryType;
            this.changeDeliveryType( this.deliveryType );
          }
        } );
    }
  }

  ngOnDestroy(): void {
    this.cartServiceGetCartSubscription?.unsubscribe();
    this.userServiceGetUserInfoSubscription?.unsubscribe();
    this.orderServiceCreateOrderSubscription?.unsubscribe();
  }

  changeDeliveryType(deliveryType: DeliveryType): void {
    this.deliveryType = deliveryType;
    this.updateDeliveryTypeValidation();
  }

  updateDeliveryTypeValidation(): void {
    if (this.deliveryType === DeliveryType.delivery) {
      this.orderForm.get( 'street' )?.setValidators( Validators.required );
      this.orderForm.get( 'street' )?.enable();
      this.orderForm.get( 'house' )?.setValidators( Validators.required );
      this.orderForm.get( 'house' )?.enable();
      this.orderForm.get( 'entrance' )?.enable();
      this.orderForm.get( 'apartment' )?.enable();
    }

    if (this.deliveryType === DeliveryType.self) {
      this.orderForm.get( 'street' )?.removeValidators( Validators.required );
      this.orderForm.get( 'house' )?.removeValidators( Validators.required );
      this.orderForm.get( 'street' )?.setValue( '' );
      this.orderForm.get( 'street' )?.disable();
      this.orderForm.get( 'house' )?.setValue( '' );
      this.orderForm.get( 'house' )?.disable();
      this.orderForm.get( 'entrance' )?.setValue( '' );
      this.orderForm.get( 'entrance' )?.disable();
      this.orderForm.get( 'apartment' )?.setValue( '' );
      this.orderForm.get( 'apartment' )?.disable();
    }

    this.orderForm.get( 'street' )?.updateValueAndValidity();
    this.orderForm.get( 'house' )?.updateValueAndValidity();
  }

  createOrder(): void {
    if (this.orderForm.valid && this.deliveryType && this.orderForm.value.firstName && this.orderForm.value.lastName &&
      this.orderForm.value.phone && this.orderForm.value.email && this.orderForm.value.paymentType) {
      const paramsObject: OrderType = {
        deliveryType: this.deliveryType,
        firstName: this.orderForm.value.firstName,
        lastName: this.orderForm.value.lastName,
        phone: this.orderForm.value.phone,
        email: this.orderForm.value.email,
        paymentType: this.orderForm.value.paymentType
      };

      if (this.deliveryType === DeliveryType.delivery) {
        if (this.orderForm.value.street) {
          paramsObject.street = this.orderForm.value.street;
        }

        if (this.orderForm.value.house) {
          paramsObject.house = this.orderForm.value.house;
        }

        if (this.orderForm.value.entrance) {
          paramsObject.entrance = this.orderForm.value.entrance;
        }

        if (this.orderForm.value.apartment) {
          paramsObject.apartment = this.orderForm.value.apartment;
        }
      }

      if (this.orderForm.value.comment) {
        paramsObject.comment = this.orderForm.value.comment;
      }

      this.orderServiceCreateOrderSubscription = this.orderService.createOrder( paramsObject )
        .subscribe( {
          next: (data: DefaultResponseType | OrderType) => {
            SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError( data as DefaultResponseType, this._snackBar );

            this.dialogRef = this.dialog.open( this.popup );
            this.dialogRef.backdropClick().subscribe( () => {
              this.router.navigate( ['/'] );
            } );
            this.cartService.setCount( 0 );
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open( errorResponse.error.message );
            } else {
              this._snackBar.open( 'Ошибка заказа' );
            }
          }
        } );
    }

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      this._snackBar.open( 'Заполните необходимые поля' );
    }
  }

  closePopup(): void {
    this.dialogRef?.close();
    this.router.navigate( ['/'] );
  }
}
