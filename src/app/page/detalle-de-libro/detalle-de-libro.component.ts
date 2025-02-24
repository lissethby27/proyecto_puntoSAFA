import {ChangeDetectorRef, Component, Input, LOCALE_ID} from '@angular/core';
import {Libro} from '../../interface/libro';
import {CurrencyPipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LibroService} from '../../service/libro.service';
import {ActivatedRoute} from '@angular/router';
import {Resena} from '../../interface/resena';
import {ResenaService} from '../../service/resena.service';
import {CarritoService} from '../../service/carrito.service';
import {AuthService} from '../../service/auth.service';


@Component({
  selector: 'app-detalle-de-libro',
  imports: [
    CurrencyPipe,
    FormsModule,
    NgForOf,
    NgIf,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  standalone: true, // tengo que comprobar esto
  templateUrl: './detalle-de-libro.component.html',
  styleUrl: './detalle-de-libro.component.css'
})
export class DetalleDeLibroComponent {
  libro?: Libro   // Variable para almacenar los detalles del libro
  quantity: number = 1; // Variable para la cantidad
  resenas: Resena[] = []; // Variable para las reseñas
  media_calificacion: number | null = null; // Variable para la calificación media
  starsArray: number[] = [];
  hasHalfStar: boolean = false;
  isLoggedIn: boolean = false;
  showAlert: boolean = false;

  constructor(
    private route: ActivatedRoute, // Para obtener el ID de la ruta
    private libroService: LibroService, // Para obtener los detalles del libro
    private resenaService: ResenaService, // Para obtener las reseñas
    private cdr: ChangeDetectorRef, // Agregado
    private carritoService:CarritoService,
    private authService: AuthService,
  ) {}

  // Método para inicializar el componente
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.obtenerLibro(id);
      this.obtenerResenas(id);
      this.obtenerMediaCalificacion(id);
      console.log('ID del libro:', id);
    }
    this.authService.getAuthState().subscribe(state => {
      this.isLoggedIn = state;
    });
  }

  // Método para obtener los detalles del libro
  obtenerLibro(id: number): void {
    this.libroService.getLibroById(id).subscribe({
      next: (data) => {
        this.libro = data;
        console.log('Libro obtenido:', this.libro);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }


  // Método para obtener las reseñas
  obtenerResenas(id: number): void {
    this.resenaService.obtenerResenasPorLibro(id).subscribe({
      next: (data) => {
        console.log('Tipo de data:', typeof data, 'Contenido:', data); // Verificar la estructura

        if (data && typeof data === 'object') {
          this.resenas = Object.values(data); // Convertir el objeto en array
        } else {
          this.resenas = []; // Si hay un error, dejar el array vacío
        }

        console.log('Resenas obtenidas:', this.resenas);
        this.cdr.detectChanges(); // Forzar actualización de la vista
      },
      error: (error) => {
        console.error('Error al obtener las reseñas:', error);
        this.resenas = []; // Evitar errores en el *ngFor si falla la API
        this.cdr.detectChanges();
      }
    });
  }


  //Método para obtener la calificación media
  obtenerMediaCalificacion(id: number): void {
    this.resenaService.obtenerMediaCalificacion(id).subscribe({
      next: (data) => {
        this.media_calificacion = Number(data) || 0;
        this.actualizarEstrellas(); // Llamar al método para actualizar las estrellas
      },
      error: (error) => {
        console.error('Error al obtener la calificación media:', error);
        this.media_calificacion = null;
      }
    });
  }




  // Método para disminuir la cantidad
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      console.log('Cantidad:', this.quantity);
    }
  }

  // Método para aumentar la cantidad
  increaseQuantity(): void {
    this.quantity++;
    console.log('Cantidad:', this.quantity);
  }

  showLoginAlert() {
    this.showAlert = true;

    // Hide the alert after 3 seconds
    setTimeout(() => {
      this.showAlert = false;
    }, 3000);
  }

  // Método para agregar al carrito
  addToCart(libro?: Libro) {
    if (!this.isLoggedIn) {
      this.showLoginAlert();
      return;
    }
    this.carritoService.addToCart(libro, this.quantity);

  }




  protected readonly isNaN = isNaN;

  actualizarEstrellas(): void {
    if (this.media_calificacion !== null) {
      const rating = this.media_calificacion;
      this.starsArray = Array(Math.floor(rating)).fill(0); // Crear array con el número entero de estrellas
      this.hasHalfStar = rating % 1 >= 0.5; // Determinar si hay media estrella
    }
  }
}
