import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from '../dto/Movie';
import { ApiService } from 'src/servies/ApiService ';
import { OMDbMovie } from '../dto/OMDbMovie';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  role: string;
  movies: Movie[] = [];
  selectedMovies: Movie[] = [];
  searchQuery: string = 'movie';
  currentPage: number = 1;
  dataSource: 'external' | 'database' = 'external';
  userRating: number = 0;
  selectedMovieDetails: OMDbMovie | null = null;
  showPopup: boolean = false;
  
  filteredMovies: Movie[] = [];
  
  imdbID: string = '';
  title: string = '';
  year: string = '';
  type: string = '';

  constructor(private router: Router, private apiService: ApiService) {
    this.role = this.router.getCurrentNavigation()?.extras.state?.['role'];
    console.log('Role after login:', this.role); 
  }

  ngOnInit(): void {
   this.fetchMovies();
    
  }

  fetchMovies(): void {
    console.log('fetchMovies called');

    if (this.role === 'ADMIN' && this.dataSource === 'external') {
      this.apiService.searchMovies(this.searchQuery, this.currentPage).subscribe({
        next: (response) => {
          if (response?.success && response.details) {
            this.filteredMovies = this.movies;
            this.movies = response.details.map(movie => ({
              ...movie,
              selected: this.isMovieSelected(movie),
              isExternal: true
            }));
          } else {
            console.log('No movies found or invalid response.');
            this.movies = [];
          }
        },
        error: (err) => {
          console.error('Error fetching movies:', err);
        }
      });
    } else {
      this.apiService.getMovies(this.currentPage).subscribe({
        next: (response) => {
          if (response?.success && response.details) {
            this.movies = response.details.map((movie: Movie) => ({
              ...movie,
              selected: this.isMovieSelected(movie),
              isExternal: false,
              userRating: 0
            }));
          } else {
            console.log('No movies found or invalid response.');
            this.movies = [];
          }
        },
        error: (err) => {
          console.error('Error fetching movies:', err);
        }
      });
    }
  }

  isMovieSelected(movie: any): boolean {
    return this.selectedMovies.some(m => m.imdbID === movie.imdbID);
  }
  toggleMovieSelection(movie: any): void {
    if (this.isMovieSelected(movie)) {
  
      this.selectedMovies = this.selectedMovies.filter(m => m.imdbID !== movie.imdbID);
    } else {
     
      this.selectedMovies = [...this.selectedMovies, movie];
    }
  }

  saveSelectedMovies(): void {
    console.log('Saved Movies:', this.selectedMovies);

    if (this.selectedMovies.length > 0) {
      this.apiService.addMovie(this.selectedMovies).subscribe({
        next: (response) => {
          console.log('Movies saved successfully:', response);
          alert('Movies saved successfully!');
        },
        error: (err) => {
          console.error('Error saving movies:', err);
          alert('Error saving movies. Please try again.');
        }
      });
    } else {
      alert('No movies selected to save.');
    }
  }

  deleteSelectedMovies(): void {
    const selectedIds = this.selectedMovies.map(movie => movie.imdbID);
    console.log('Deleting movies with IDs:', selectedIds);

    if (selectedIds.length > 0) {
      this.apiService.deleteMovies(selectedIds).subscribe({
        next: (response) => {
          console.log('Movies deleted successfully:', response);
          alert('Movies deleted successfully!');
          this.fetchMovies();
        },
        error: (err) => {
          console.error('Error deleting movies:', err);
          alert('Error deleting movies. Please try again.');
        }
      });
    } else {
      alert('No movies selected to delete.');
    }
  }

  addRating(movie: Movie): void {

    if (movie.score === undefined || movie.score < 1 || movie.score > 5) {
      alert('Please enter a rating between 1 and 5.');
      return;
    }

    this.apiService.addRating(movie.imdbID, movie.score).subscribe({
      next: (response) => {
  
        if (response.success) {
          alert(`Rating added successfully for movie: ${response.details}`); 
          this.fetchMovies(); 
        } else {
          console.error('Failed to add rating:', response.message);
          alert(`Failed to add rating: ${response.message}`);
        }
      },
      error: (err) => {
        console.error('Error adding rating:', err);
        alert('Error adding rating. Please try again.'); 
      }
    });
  }
  fetchMovieDetails(imdbID: string): void {
    this.apiService.searchByOmdb(imdbID).subscribe(response => {
      if (response.success) {
        this.selectedMovieDetails = response.details;
        this.showPopup = true;
      } else {
        alert("Movie details not available");
      }
    });
  }
  onNextPage(): void {
    this.currentPage++;
    this.fetchMovies();
  }

  onPrevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchMovies();
    }
  }
  closePopup(): void {
    this.showPopup = false;
    this.selectedMovieDetails = null;
  }
  logout(): void {
    this.apiService.logout();
  }
  searchMovies() {
    this.apiService.search(this.imdbID, this.title, this.year, this.type).subscribe(
      response => {
        if (response.success) {
          this.movies = response.details;
        } else {
          console.log('No movies found');
        }
      },
      error => {
        console.log('Error:', error);
      }
    );
  }

}