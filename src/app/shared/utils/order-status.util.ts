import {OrderStatusType} from "../../../types/order-status.type";

export class OrderStatusUtil {
  static getStatusAndColor(status: OrderStatusType | undefined | null): { name: string, color: string } {
    if (!status) {
      return {
        name: 'Ошибка',
        color: '#CCCCCC'
      }
    }
	
	if (!((Object.values(OrderStatusType) as string[]).includes(status))) {
      return {
        name: 'Неизвестный',
        color: '#CCCCCC'
      }
    }

    const names = {
      new: 'Новый',
      pending: 'Обработка',
      delivery: 'Доставка',
      cancelled: 'Отменён',
      success: 'Выполнен'
    };

    const colors = {
      new: '#6CAC72',
      pending: '#2C2C2C',
      delivery: '#456F49',
      cancelled: '#FF7575',
      success: '#B6D5B9'
    }

    return {
      name: names[OrderStatusType[status]],
      color: colors[OrderStatusType[status]]
    }
  }
}
