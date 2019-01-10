 import {Component, Inject, OnInit} from '@angular/core';
 import {Problem} from '../../models/problem.model';
 import {DataService} from '../../services/data.service';
 import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-problem-list',
  templateUrl: './problem-list.component.html',
  styleUrls: ['./problem-list.component.css']
})
export class ProblemListComponent implements OnInit {

  problems: Problem[] = [];

  subscriptionProblem: Subscription;

  term: string;

  constructor(@Inject('data') private data,
              @Inject('input') private input) { }

  ngOnInit() {
    console.log('This is problem List!!!');
    this.getProblems();
    console.log(this.problems);
    this.input.getInput().subscribe(term => {
      this.term = term;
    });
  }

  getProblems(): void {
    this.problems = this.data.getProblems()
      .subscribe(problems => this.problems = problems );
  }
}
