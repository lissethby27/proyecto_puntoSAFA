import {Component, Input, LOCALE_ID, OnInit} from '@angular/core';
import {CurrencyPipe, NgForOf, NgIf} from '@angular/common';
import {Libro} from '../../interface/libro';
import {LibroService} from '../../service/libro.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {Categoria} from '../../interface/categoria';
import {ActivatedRoute, Router} from '@angular/router';
import {CategoriaService} from '../../service/categoria.service';
import {CarritoService} from '../../service/carrito.service';
import {AuthService} from '../../service/auth.service';




@Component({
  selector: 'app-catalogo',
  templateUrl: '/catalogo.component.html',
  styleUrls: ['./catalogo.component.css'],
  imports: [
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    CurrencyPipe,
      ],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }]
})
export class CatalogoComponent  implements OnInit {
  libros: Libro[] = [];
  filteredBooks: Libro[] = [];
  searchTerm: string = '';
  categories: Categoria[] = [];
  selectedCategoryId: number | null = null;
  currentPage: number = 1;
  totalPages: number = 1; // Placeholder, will be set dynamically
  limit: number = 12;
  isLoggedIn: boolean = false;
  showAlert: boolean = false;
  filter:string ='';
  selectedPriceRanges:string[] =[];

  constructor(private libroService: LibroService, private http:HttpClient,
              private router:Router, private route:ActivatedRoute,
              private categoriaService:CategoriaService, private carritoService:CarritoService, private authService:AuthService) {}

  @Input() categoriaId!: number;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filter = params['search'] || '';
      this.currentPage = params['page'] ? parseInt(params['page'], 10) : 1;
      this.limit = params['limit'] ? parseInt(params['limit'], 10) : 9;


      // Lee el parámetro categoryId
      const categoryId = params['categoryId'] ? parseInt(params['categoryId'], 10) : null;


      // Si hay un categoryId, aplicamos el filtro directamente
      if (categoryId) {
        this.libroService.getFilteredBooks([], categoryId, this.currentPage, this.limit).subscribe({
          next: (books) => {
            this.filteredBooks = books;
            this.totalPages = Math.ceil(books.length / this.limit);
          },
          error: (error) => console.error(error)
        });
      } else {
        // Si no hay categoryId, cargamos todos los libros
        this.cargarLibros(this.currentPage, this.limit);
      }
    });


    // Obtén las categorías disponibles
    this.categoriaService.getCategorias().subscribe(categorias => {
      this.categories = categorias;
    });
  }



  // cargarLibros(page: number = 1, limit: number = 9): void {
  //   this.currentPage = page;
  //
  //   if (this.selectedPriceRange) {
  //     this.filterByPrice(this.selectedPriceRange, page, limit);
  //   } else if (this.selectedCategoryId) {
  //     this.filterByCategory(this.selectedCategoryId, page, limit);
  //   } else {
  //     this.libroService.getBooks(page, limit).subscribe({
  //       next: (data) => {
  //         this.libros = data;
  //         this.filteredBooks = [...this.libros];
  //         this.totalPages = Math.ceil(50 / limit);
  //         if (this.searchTerm) {
  //           this.searchBooks(); // Ensure search runs after books load
  //         }
  //       },
  //       error: (error) => console.error(error)
  //     });
  //   }
  // }

  cargarLibros(page: number = 1, limit: number = 9): void {
    this.currentPage = page;


    // Si hay un rango de precios seleccionado, aplica el filtro por precio
    if (this.selectedPriceRange) {
      this.filterByPrice(this.selectedPriceRange, page, limit);
    }
    // Si hay una categoría seleccionada, aplica el filtro por categoría
    else if (this.selectedCategoryId) {
      this.filterByCategory(this.selectedCategoryId, page, limit);
    }
    // Si no hay filtros, carga todos los libros
    else {
      this.libroService.getBooks(page, limit).subscribe({
        next: (data) => {
          this.libros = data;
          this.filteredBooks = [...this.libros];
          this.totalPages = Math.ceil(50 / limit); // Actualiza según la respuesta del backend
        },
        error: (error) => console.error(error)
      });
    }
    console.log('Selected Category ID:', this.selectedCategoryId);




  }







  noResults: boolean = false;

  searchBooks(): void {
    if (!this.libros || this.libros.length === 0) {
      console.warn('No books available for searching.');
      return;
    }
    const searchTerm = this.searchTerm.toLowerCase().trim();
    console.log('Filtered term in catalogue component:', searchTerm);

    if (!searchTerm) {
      this.filteredBooks = this.libros;
      this.noResults = false;
    }

    this.filteredBooks = this.libros.filter(libro => {
      const { nombre, apellidos } = libro.autor || {}; // Ensure autor exists
      return (
        libro.titulo?.toLowerCase().includes(searchTerm) ||
        (apellidos && apellidos.toLowerCase().includes(searchTerm)) ||
        (nombre && nombre.toLowerCase().includes(searchTerm))
      );
    });

    this.noResults = this.filteredBooks.length === 0;
    console.log('Filtered books:', this.filteredBooks);
    console.log('No results:', this.noResults);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredBooks = this.libros;
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);

    // Reload the page
    window.location.reload();
  }


  selectedPriceRange: string | null = null;
  filterByPrice(range: string, page: number = 1, limit: number = 9): void {
    if (this.selectedPriceRange === range) {
      this.selectedPriceRange = null;
      this.filteredBooks = this.libros;
    } else {
      this.selectedPriceRange = range;
      this.libroService.getLibrosByPrecio(range, page, limit).subscribe({
        next: (libros) => {
          this.filteredBooks = libros;
          this.totalPages = Math.ceil(libros.length / limit); // Update total pages
          this.currentPage = page;
        },
        error: (error) => console.error(error)
      });
    }
  }


  filterByCategory(categoryId: number, page: number = 1, limit: number = 9): void {
    if (this.selectedCategoryId === categoryId) {
      this.selectedCategoryId = null;
      this.filteredBooks = this.libros;
    } else {
      this.selectedCategoryId = categoryId;
      this.libroService.getBooksByCategory(categoryId, page, limit).subscribe({
        next: (books) => {
          this.filteredBooks = books;
          this.totalPages = Math.ceil(books.length / limit);
          this.currentPage = page;
        },
        error: (error) => console.error(error)
      });
    }
  }

  applyFilters(page: number = 1, limit: number = 9): void {
    this.libroService.getFilteredBooks(this.selectedPriceRanges, this.selectedCategoryId, page, limit).subscribe({
      next: (books) => {
        this.filteredBooks = books;
        this.totalPages = Math.ceil(books.length / limit);
        this.currentPage = page;
      },
      error: (error) => console.error(error)
    });
    console.log('Applying filters with:', {
      priceRanges: this.selectedPriceRanges,
      categoryId: this.selectedCategoryId,
      page: page,
      limit: limit
    });
  }


    goToPage(page: number): void {
    this.router.navigate([], {
      queryParams: {
        page,
        limit: this.limit,
        search: this.searchTerm || null,
        price: this.selectedPriceRange || null,
        category: this.selectedCategoryId || null
      },
      queryParamsHandling: 'merge',
    });
  }



  addToCart(libro: Libro) {
    if (!this.isLoggedIn) {
      this.showLoginAlert();
      return;
    }
    this.carritoService.addToCart(libro);

  }



  showLoginAlert() {
    this.showAlert = true;

    // Hide the alert after 3 seconds
    setTimeout(() => {
      this.showAlert = false;
    }, 3000);
  }

  verDetallesLibro(idLibro: number): void {
    this.router.navigate(['/detalle-libro', idLibro]);
  }

}
