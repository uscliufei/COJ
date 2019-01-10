import { Injectable } from '@angular/core';
import {Problem} from '../models/problem.model';
import {Http, Response, Headers, RequestOptionsArgs, RequestOptions} from '@angular/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class DataService {

  private problemsSource = new BehaviorSubject<Problem[]>([]);

  constructor(private http: Http) { }

  getProblems(): Observable<Problem[]> {
    this.http.get('api/v1/problems')
      .subscribe(res => {
        this.problemsSource.next(res.json());
      }, (err) => {
        this.handleError(err);
      });


    return this.problemsSource.asObservable();
  }

  getProblem(id): Promise<Problem> {
    return this.http.get(`api/v1/problems/${id}`)
      .toPromise()
      .then(function(res: Response) {
        return res.json();
      })
      .catch(this.handleError);
  }

  addProblem(problem: Problem): Promise<Problem> {
    let headers = new Headers({'Content-Type': 'application/json' });
    let options = new RequestOptions({headers: headers});
    return this.http.post('api/v1/problems', problem, options)
      .toPromise()
      .then((res: Response) => {
        this.getProblems();
        return res.json();
      })
      .catch(this.handleError);
  }

  buildAndRun(code): Promise<Object> {
    let headers = new Headers({'content-Type': 'application/json' });
    let options = new RequestOptions({headers: headers});
    return this.http.post('api/v1/build_and_run', code, options)
      .toPromise()
      .then((res: Response) => {
        return res.json();
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.body || error);
  }
}
