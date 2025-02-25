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
  selectedCategoryId: number | null = null
  selectedPriceRange: string | null = null;
  currentPage: number = 1;
  totalPages: number = 1; // Placeholder, will be set dynamically
  limit: number = 12;
  isLoggedIn: boolean = false;
  showAlert: boolean = false;
  priceFilter:string | null = null;
  priceRanges = [
    { label: "Menos de 5 euros", value: "menor5" },
    { label: "De 5 a 10 euros", value: "5-10" },
    { label: "De 10 a 15 euros", value: "10-15" },
    { label: "De 15 a 40 euros", value: "15-40" },
    { label: "Más de 40 euros", value: "mayor40" }
  ];

  constructor(private libroService: LibroService, private http:HttpClient,
              private router:Router, private route:ActivatedRoute,
              private categoriaService:CategoriaService, private carritoService:CarritoService, private authService:AuthService) {}

  @Input() categoriaId!: number;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Query Params:', params);
      this.searchTerm = params['search'] || '';
      console.log('Received search term from query params:', this.searchTerm);
      this.currentPage = params['page'] ? parseInt(params['page'], 10) : 1;
      this.limit = params['limit'] ? parseInt(params['limit'], 10) : 9;

      this.cargarLibros(this.currentPage, this.limit);
    });

    this.categoriaService.getCategorias().subscribe(categorias => {
      this.categories = categorias;
    });
    this.authService.getAuthState().subscribe(state => {
      this.isLoggedIn = state;
    });
  }


  cargarLibros(page: number = 1, limit: number = 9): void {
    this.currentPage = page;
    if (!this.selectedCategoryId && !this.selectedPriceRange) {
      this.libroService.getBooks(page, limit).subscribe({
        next: (data: Libro[]) => {
          this.libros = data;
          this.filteredBooks = [...this.libros];
          this.totalPages = Math.ceil(50 / limit);

          if (this.searchTerm) {
            this.searchBooks();
          }
        },
        error: (error) => console.error(error)
      });
    } else {
      this.libroService.getLibrosByFilter(this.selectedCategoryId || undefined, this.selectedPriceRange || undefined, page, limit).subscribe({
        next: (data) => {
          this.libros = data;
          this.filteredBooks = [...this.libros];
          this.totalPages = Math.ceil(50 / limit);

          if (this.searchTerm) {
            this.searchBooks();
          }
        },
        error: (error) => console.error(error)
      });
    }
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

  // selectedPriceRange: string | null = null;
  // filterByPrice(range: string, page: number = 1, limit: number = 9): void {
  //   if (this.selectedPriceRange === range) {
  //     this.selectedPriceRange = null;
  //     this.filteredBooks = this.libros;
  //   } else {
  //     this.selectedPriceRange = range;
  //     this.libroService.getLibrosByPrecio(range, page, limit).subscribe({
  //       next: (libros) => {
  //         this.filteredBooks = libros;
  //         this.totalPages = Math.ceil(libros.length / limit); // Update total pages
  //         this.currentPage = page;
  //       },
  //       error: (error) => console.error(error)
  //     });
  //   }
  // }

  // selectedPriceRange: string | null = null;
  // filterByPrice(range: string, page: number = 1, limit: number = 9): void {
  //   if (this.selectedPriceRange === range) {
  //     this.selectedPriceRange = null;
  //     this.filteredBooks = this.libros;
  //   } else {
  //     this.selectedPriceRange = range;
  //     this.libroService.getLibrosByPrecio(range, page, limit).subscribe({
  //       next: (libros) => {
  //         this.filteredBooks = libros;
  //         this.totalPages = Math.ceil(libros.length / limit); // Update total pages
  //         this.currentPage = page;
  //       },
  //       error: (error) => console.error(error)
  //     });
  //   }
  // }


  // filterByCategory(categoryId: number, page: number = 1, limit: number = 9): void {
  //   if (this.selectedCategoryId === categoryId) {
  //     this.selectedCategoryId = null;
  //     this.filteredBooks = this.libros;
  //   } else {
  //     this.selectedCategoryId = categoryId;
  //     this.libroService.getBooksByCategory(categoryId, page, limit).subscribe({
  //       next: (books) => {
  //         this.filteredBooks = books;
  //         this.totalPages = Math.ceil(books.length / limit);
  //         this.currentPage = page;
  //       },
  //       error: (error) => console.error(error)
  //     });
  //   }
  // }

  // filterByCategory(categoryId: number, page: number = 1, limit: number = 9): void {
  //   if (this.selectedCategoryId === categoryId) {
  //     this.selectedCategoryId = null;
  //     this.filteredBooks = this.libros;
  //   } else {
  //     this.selectedCategoryId = categoryId;
  //     this.libroService.getBooksByCategory(categoryId, page, limit).subscribe({
  //       next: (books) => {
  //         this.filteredBooks = books;
  //         this.totalPages = Math.ceil(books.length / limit);
  //         this.currentPage = page;
  //       },
  //       error: (error) => console.error(error)
  //     });
  //   }
  // }

  onPriceChange(priceRange: string | null): void {
    console.log("🎯 Price Filter Changed To:", priceRange);
    this.selectedPriceRange = priceRange;
    this.applyFilters();
    if (priceRange === null) {
      const priceRadios = document.getElementsByName("priceRange") as NodeListOf<HTMLInputElement>;
      priceRadios.forEach(radio => radio.checked = false);
    }
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;  // Update the selected category
    this.applyFilters();  // Apply filters with the new selection
    if (categoryId === null) {
      const categoryRadios = document.getElementsByName("category") as NodeListOf<HTMLInputElement>;
      categoryRadios.forEach(radio => radio.checked = false);
    }
  }


  applyFilters(): void {
    console.log("🔍 Applying filters:");
    console.log("Category ID:", this.selectedCategoryId);
    console.log("Price Range:", this.selectedPriceRange);
    this.libroService.getLibrosByFilter(
      this.selectedCategoryId || undefined,
      this.selectedPriceRange || undefined // No changes needed for price
    ).subscribe({
      next: (data) => {
        console.log("✅ Filtered books received:", data);
        this.filteredBooks = data;
      },
      error: (error) => console.error(error)
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
