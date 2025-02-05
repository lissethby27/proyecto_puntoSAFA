import { Component, OnInit } from '@angular/core';
import {BuscadorInicioComponent} from '../../component/buscador-inicio/buscador-inicio.component';
import {
  CajasCategoriaInicioComponent
} from '../../component/Inicio_componentes_propios/cajas-categoria-inicio/cajas-categoria-inicio.component';
import {CarouselComponent} from '../../component/Inicio_componentes_propios/carousel/carousel.component';
import {
  HeroSectionInicioComponent
} from '../../component/Inicio_componentes_propios/hero-section-inicio/hero-section-inicio.component';
import {HeaderComponent} from '../../component/header/header.component';
import {FooterComponent} from '../../component/footer/footer.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    BuscadorInicioComponent,
    CajasCategoriaInicioComponent,
    CarouselComponent,
    HeroSectionInicioComponent

  ]
})
export class HomeComponent implements OnInit {

  constructor() {}
  ngOnInit() {}

  scrollLeft() {

  }
}
