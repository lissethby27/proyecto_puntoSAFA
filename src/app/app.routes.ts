import { Routes } from '@angular/router';


import {RegistroComponent} from './page/registro/registro.component';
import {LoginComponent} from './page/login/login.component';
import {HomeComponent} from './page/home/home.component';
import {AutorComponent} from './page/autor/autor.component';
import {PerfilComponent} from './page/perfil/perfil.component';
import {CatalogoComponent} from './page/catalogo/catalogo.component';
import {DetalleDeLibroComponent} from './page/detalle-de-libro/detalle-de-libro.component';
import {PerfilAdmComponent} from './page/perfil-adm/perfil-adm.component';
import {
  RecomendacionLibroComponent
} from './component/Inicio_componentes_propios/recomendacion-libro/recomendacion-libro.component';
import {CarouselComponent} from './component/Inicio_componentes_propios/carousel/carousel.component';



export const routes: Routes = [

  //Comprobación de componentes de Alba
  {path: 'carrusel', component: CarouselComponent, pathMatch: 'full'},
  {path: 'recomendacionLibro', component: RecomendacionLibroComponent, pathMatch: 'full'},

  //Comprobación de componentes
  {path: '', component: HomeComponent, pathMatch: 'full' },
  {path: 'registro', component:RegistroComponent, pathMatch: 'full'},
  {path: 'login', component:LoginComponent, pathMatch: 'full'},
  {path: 'home', component:HomeComponent, pathMatch: 'full'},
  {path:'autor', component:AutorComponent, pathMatch: 'full'},
  {path:'catalogo', component: CatalogoComponent, pathMatch: 'full'},
  {path:'perfil', component:PerfilComponent, pathMatch: 'full'},
  {path: 'detalle-libro/:id', component: DetalleDeLibroComponent }, // Ruta para detalles del libro
  {path: 'perfil-adm', component: PerfilAdmComponent, pathMatch: 'full'},





];
