import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import {jwtDecode} from 'jwt-decode';
import { environment } from 'src/app/environment/environments';
import { Movie } from 'src/app/dto/Movie';
import { OMDbMovie } from 'src/app/dto/OMDbMovie';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
   

  constructor(private http: HttpClient) {}

  login(body: any): Observable<any> {
    const url = environment.apiUrl + '/v1/auth/login';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post(url, JSON.stringify(body), { headers });
  }
  decodeToken(token: string): { role: string } | null {
    try {
      const decodedToken: any = jwtDecode(token);
      return { role: decodedToken.role }; 
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
  searchMovies(query: string, page: number): Observable<{ success: boolean, details: Movie[] }> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
      'Content-Type': 'application/json; charset=utf-8'
    });
  
    return this.http.get<{ success: boolean, details: Movie[] }>(
      `${environment.apiUrl}/movies/search?query=${query}&page=${page}`,
      { headers }
    );
  }
  getMovies(page: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
      'Content-Type': 'application/json; charset=utf-8'
    });
  
    return this.http.get(`${environment.apiUrl}/movies/movies?page=${page}`, { headers });
  }
  addMovie(movies: Movie[]): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
      'Content-Type': 'application/json; charset=utf-8'
    });

    return this.http.post(`${environment.apiUrl}/movies/save`, movies, { headers });
  }

  deleteMovies(ids: string[]): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
      'Content-Type': 'application/json; charset=utf-8'
    });

    return this.http.delete(`${environment.apiUrl}/movies/delete`, { headers, body: ids });
  }
  
  addRating(imdbID: string, score: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
      'Content-Type': 'application/json; charset=utf-8'
    });

    const body = { imdbID, score };
    return this.http.post(`${environment.apiUrl}/ratings/add`, body, { headers });
  }
  searchByOmdb(imdb: string): Observable<{ success: boolean, details: OMDbMovie | null }> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
      'Content-Type': 'application/json; charset=utf-8'
    });
  
    return this.http.get<{ message: string, success: boolean, details: OMDbMovie }>(
      `${environment.apiUrl}/movies/imdb?imdb=${imdb}`,
      { headers }
    ).pipe(
      map(response => ({
        success: response.success,
        details: response.details
      })),
      catchError(error => {
        console.error("Error fetching movie:", error);
        return of({ success: false, details: null }); 
      })
    );
  }
  logout(): void {
    localStorage.removeItem('sessionToken');
    window.location.href = '/login'; 
  
}
search(imdbID: string, title: string, year: string, type: string): Observable<{ success: boolean, details: Movie[] }> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
    'Content-Type': 'application/json; charset=utf-8',
  });

  return this.http.get<{ success: boolean, details: Movie[] }>(
    `${environment.apiUrl}/search?imdbID=${imdbID}&title=${title}&year=${year}&type=${type}`,
    { headers }
  );
}
}
