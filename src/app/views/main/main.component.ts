import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from "../../shared/services/product.service";
import {ProductType} from "../../../types/product.type";
import {OwlOptions} from "ngx-owl-carousel-o";
import {config} from "../../shared/config/config";
import {Subscription} from "rxjs";
import {AuthService} from "../../core/auth/auth.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  products: ProductType[] = [];
  isLogged: boolean = false;
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    margin: 25,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  }
  customOptionsReviews: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    margin: 26,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      }
    },
    nav: false
  }
  reviews: { name: string, image: string, text: string }[] = [
    {
      name: 'Ирина',
      image: 'review-1.png',
      text: 'В ассортименте я встретила все комнатные растения, которые меня интересовали. Цены - лучшие в городе. Доставка - очень быстрая и с заботой о растениях.'
    },
    {
      name: 'Анастасия',
      image: 'review-2.png',
      text: 'Спасибо огромное! Цветок арека невероятно красив - просто бомба! От него все в восторге! Спасибо за сервис - все удобно сделано, доставили быстро. И милая открыточка приятным бонусом.'
    },
    {
      name: 'Илья',
      image: 'review-3.png',
      text: 'Магазин супер! Второй раз заказываю курьером, доставлено в лучшем виде. Ваш ассортимент комнатных растений впечатляет! Спасибо вам за хорошую работу!'
    },
    {
      name: 'Аделина',
      image: 'review-4.png',
      text: 'Хочу поблагодарить всю команду за помощь в подборе подарка для моей мамы! Все просто в восторге от мини-сада! А самое главное, что за ним удобно ухаживать, ведь в комплекте мне дали целую инструкцию.'
    },
    {
      name: 'Яника',
      image: 'review-5.png',
      text: 'Спасибо большое за мою обновлённую коллекцию суккулентов! Сервис просто на 5+: быстро, удобно, недорого. Что ещё нужно клиенту для счастья?'
    },
    {
      name: 'Марина',
      image: 'review-6.png',
      text: 'Для меня всегда важным аспектом было наличие не только физического магазина, но и онлайн-маркета, ведь не всегда есть возможность прийти на место. Ещё нигде не встречала такого огромного ассортимента!'
    },
    {
      name: 'Станислав',
      image: 'review-7.png',
      text: 'Хочу поблагодарить консультанта Ирину за помощь в выборе цветка для моей жены. Я ещё никогда не видел такого трепетного отношения к весьма непростому клиенту, которому сложно угодить! Сервис – огонь!'
    },
  ]
  deliveryCost: number = config.deliveryCost;
  productServiceGetBestProductsSubscription: Subscription | null = null;
  authServiceIsLogged$Subscription: Subscription | null = null;

  constructor(private productService: ProductService,
              private authService: AuthService) {
    this.isLogged = this.authService.isLogged;
  }

  ngOnInit(): void {
    this.productServiceGetBestProductsSubscription = this.productService.getBestProducts()
      .subscribe((data: ProductType[]) => {
        if (data.length) {
          this.products = data;
        }
      });

    this.authServiceIsLogged$Subscription = this.authService.isLogged$
      .subscribe((isLogged: boolean) => {
        this.isLogged = isLogged;
      });
  }

  ngOnDestroy(): void {
    this.productServiceGetBestProductsSubscription?.unsubscribe();
    this.authServiceIsLogged$Subscription?.unsubscribe();
  }
}
