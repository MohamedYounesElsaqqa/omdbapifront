import { Movie } from "./Movie";



export interface MovieSearchResponse {
    message: string;
    success: boolean;
    details: Movie[];
    dateTime: string;
  }
  