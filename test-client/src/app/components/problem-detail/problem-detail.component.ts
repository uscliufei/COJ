import {Component, Inject, Injectable, OnInit} from '@angular/core';
import {Problem} from '../../models/problem.model';
import { ActivatedRoute, Params } from '@angular/router';
import {applySourceSpanToExpressionIfNeeded} from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-problem-detail',
  templateUrl: './problem-detail.component.html',
  styleUrls: ['./problem-detail.component.css']
})
export class ProblemDetailComponent implements OnInit {

  problem: Problem;

  constructor(private route: ActivatedRoute, @Inject('data') private data) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.problem = this.data.getProblem(+params['id']).then(problem => this.problem = problem);
      });
  }

}
