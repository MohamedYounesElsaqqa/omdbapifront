export interface Movie {
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
    Type: string;
    averageRating: number;
    selected?: boolean; 
    isExternal: boolean;
    score?: number;
  }