import {CartType} from "../../../types/cart.type";

export class CartUtil {
  static calculateTotal(cart: CartType): [totalAmount: number, totalCount: number] {
    let totalAmount: number = 0;
    let totalCount: number = 0;

    if (cart) {
      cart.items.forEach(item => {
        totalAmount += item.product.price * item.quantity;
        totalCount += item.quantity;
      });
    }
    return [totalAmount, totalCount];
  }
}
