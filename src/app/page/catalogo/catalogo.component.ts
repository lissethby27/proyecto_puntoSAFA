import {Component, Input, OnInit} from '@angular/core';
import {CurrencyPipe, NgForOf, NgIf} from '@angular/common';
import {Libro} from '../../interface/libro';
import {LibroService} from '../../service/libro.service';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {Categoria} from '../../interface/categoria';
import {CategoriaService} from '../../service/categoria.service';



@Component({
  selector: 'app-catalogo',
  templateUrl: '/catalogo.component.html',
  styleUrls: ['./catalogo.component.css'],
  imports: [
    CurrencyPipe,
    NgForOf,
    FormsModule,
    NgIf,
    HttpClientModule

  ]
})
export class CatalogoComponent  implements OnInit {
  libros: Libro[] = [];
  filteredBooks: Libro[] = [];
  categories: Categoria[] = [];
  filter: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPagesArray: number[] = [];
  // ordernarPor:string ='titulo'
  selectedCategoryId: number | null = null;

    constructor(private libroService: LibroService, private route:ActivatedRoute, private categoriaService: CategoriaService, private http: HttpClient) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filter = params['search'] || '';
      this.cargarLibros().then(() => {
        if (this.filter) {
          this.searchBooks();
        }
      });
    });

    this.categoriaService.getCategorias().subscribe(categorias => {
      this.categories = categorias;
    });

  }

  async cargarLibros(): Promise<void> {
    try {
      // const params = { ordenarPor: this.ordernarPor  };
      // this.libros = await this.libroService.sortLibros(params);
      // this.libroService.sortLibros({ordenarPor: this.ordernarPor}).then(
      //   libros => {
      //     this.libros = libros;
      //   }
      // )

      const params = { page: this.currentPage, limit: this.itemsPerPage };
      this.libros = await this.libroService.getLibros(params);
      this.filteredBooks = [...this.libros];
      this.setupPagination();
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  }



  searchBooks(): void {
    const searchTerm = this.filter.toLowerCase().trim();

    if (!searchTerm) {
      this.filteredBooks = this.libros;
    } else {
      this.filteredBooks = this.libros.filter(libro =>
        libro.titulo?.toLowerCase().includes(searchTerm) ||
        libro.autor?.apellidos?.toLowerCase().includes(searchTerm) ||
        libro.autor?.nombre?.toLowerCase().includes(searchTerm)
      );
    }
  }
  clearSearch(): void {
    this.filter = '';
    this.filteredBooks = this.libros;
  }

  selectedPriceRange: string | null = null;
  filterByPrice(range: string): void{
    if (this.selectedPriceRange === range){
      this.selectedPriceRange = null;
      this.filteredBooks = this.libros;
    }else{
      this.selectedPriceRange = range;
      this.libroService.getLibrosByPrecio(range).subscribe(libros => {
        this.filteredBooks = libros;
      },error => {
        console.error('Error fetching books by price:', error);
        }
      )
    }

  }

  filterByCategory(categoryId:number):void{
    if(this.selectedCategoryId === categoryId){
      this.selectedCategoryId = null;
      this.filteredBooks = this.libros;

    }else{
      this.selectedCategoryId = categoryId;
      this.libroService.getBooksByCategory(categoryId).subscribe(books => {
        this.filteredBooks = books;
      },
        error => {
        console.error('Error fetching books by category:', error);
        })
    }
  }




  showCart = false;
  toggleCart() {
    this.showCart = !this.showCart;
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.cargarLibros();
  }

  setupPagination(): void {
    const totalBooks = this.libros.length; // This should ideally come from the API
    const totalPages = Math.ceil(totalBooks / this.itemsPerPage);
    this.totalPagesArray = Array(totalPages).fill(0).map((_, i) => i + 1);
  }


}
