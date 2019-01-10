import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {tokenNotExpired} from 'angular2-jwt';
import 'rxjs/add/operator/filter';
import * as auth0 from 'auth0-js';
import {Observable} from 'rxjs/Observable';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AuthService {
    clientId = '0BNU_RQhXyQdcpfA8L44fTGPqBztOsgS';
    domain = 'cxycoj.auth0.com';
    auth0 = new auth0.WebAuth({
    clientID: '0BNU_RQhXyQdcpfA8L44fTGPqBztOsgS',
    domain: 'cxycoj.auth0.com',
    responseType: 'token id_token',
    audience: 'https://cxycoj.auth0.com/userinfo',
    redirectUri: 'http://localhost:3000/',
    scope: 'openid profile' ,
  });

  constructor(public router: Router, private http: Http) {
  }
  namespace = 'https://cxycoj.auth0.com.roles';
  userProfile: any;
  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
        if (!this.isAuthenticated()) {
          this.auth0.parseHash((err, authResult) => {
            console.log('handle callback! before if');
            if (authResult && authResult.accessToken && authResult.idToken) {
              console.log('handle callback!');
              this.setSession(authResult);
            } else if (err) {
              console.log('An error happen!');
              console.log(err);
              alert(`Error: ${err.error}. Check the console for further details.`);
            }
          });
        } else {
          this.userProfile = this.returnProfile();
          console.log(this.userProfile);
          console.log(this.userProfile[this.namespace]);
        }
     }

  private setSession( authResult): void {
    // Set the time that the access token will expire at
    console.log('This is sersession function');
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    this.auth0.client.userInfo(authResult.accessToken, (err, profile) => {
      console.log('This is callback funtion!!!!');
      if (profile) {
        localStorage.setItem('profile', JSON.stringify(profile));
        this.userProfile = this.returnProfile();
        console.log(this.userProfile);
      }
      console.log(err);
    });
  }

  public logout() {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('profile');
    // Go back to the home route
    this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  public getProfile(cb): void {
    const accessToken = localStorage.getItem('access_token');
    console.log(accessToken);
    if (!accessToken) {
      throw new Error('Access token must exist to fetch profile');
    }
    const self = this;
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      console.log(profile);
      if (profile) {
        localStorage.setItem('profile', JSON.stringify(this.userProfile));
      }
      cb(err, profile);
    });
  }

  public returnProfile(): any {
    return JSON.parse(localStorage.getItem('profile'));
  }

  public resetPassword(): void {
    let profile = this.returnProfile();
    console.log(profile.name);
    let url: string = 'https://cxycoj.auth0.com/dbconnections/change_password';
    let headers = new Headers({'content-type': 'application/json'});
    let options = new RequestOptions({headers: headers});
    let body = {
      client_id: '0BNU_RQhXyQdcpfA8L44fTGPqBztOsgS',
      email: profile.name,
      connection: 'Username-Password-Authentication',
   };

    this.http.post(url, body, options)
      .toPromise()
      .then((res: Response) => {
        console.log(res.json());
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('Error occurred', error);
    return Promise.reject(error.message || error);
  }

}
