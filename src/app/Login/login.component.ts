import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from 'src/servies/ApiService ';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService, 
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
    
      this.apiService.login(loginData).subscribe({
        next: (response) => {
          if (response.success && response.details.sessionToken) {
            localStorage.setItem('sessionToken', response.details.sessionToken);
  
            const decodedToken = this.apiService.decodeToken(response.details.sessionToken);
            if (decodedToken) {
              const role = decodedToken.role;
  
              this.router.navigate(['/dashboard'], { state: { role } });
            } else {
              this.errorMessage = 'Failed to decode token';
            }
          } else {
            this.errorMessage = 'Invalid credentials or unexpected response';
          }
        },
        error: (err) => {
          this.errorMessage = 'Login failed. Please check your username and password.';
          console.error(err);
        }
      });
    }
  }
}