import {Inject, Injectable} from '@angular/core';
import {CanActivate} from '@angular/router';
import {Router, } from '@angular/router';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(@Inject('auth') private auth, public router: Router) { }

  namespace = 'https://cxycoj.auth0.com';

  profile: any;
  canActivate(): boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/problems']);
      return false;
    }
  }

  isAdmin(): boolean {
    this.profile = this.auth.returnProfile();
    if (this.auth.isAuthenticated() && this.auth.
      returnProfile().nickname === 'admin') {
      return true;
    } else {
      return false;
    }
  }

}
