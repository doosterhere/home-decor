import {Component, OnInit} from '@angular/core';
import {OrderService} from "../../../shared/services/order.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {OrderType} from "../../../../types/order.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {OrderStatusUtil} from "../../../shared/utils/order-status.util";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: OrderType[] = [];

  constructor(private orderService: OrderService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.orderService.getOrders().subscribe((data: OrderType[] | DefaultResponseType) => {
      if ((data as DefaultResponseType).error) {
        const message = (data as DefaultResponseType).message;
        this._snackBar.open(message);
        throw new Error(message);
      }

      this.orders = (data as OrderType[]).map(item => {
        item.statusAndColor = OrderStatusUtil.getStatusAndColor(item.status);
        return item;
      });
    });
  }
}
