import {Observable} from 'rxjs';
import {run} from '@cycle/rxjs-run';
import {makeDOMDriver} from '@cycle/dom';
import {div} from '@cycle/dom';

import component from './component.js';

function main(sources) {
  const props$ = Observable.of({
    value: 10
  });

  const child1 = component({
    DOM: sources.DOM,
    props: props$
  });

  const child2 = component({
    DOM: sources.DOM,
    props: props$
  });


  const vdom$ = Observable.combineLatest(child1.DOM, child2.DOM)
    .map(([dom1, dom2]) => {
      return div([
        dom1,
        dom2
      ]);
    });

  return {
    DOM: vdom$
  };
}

run(main, {
  DOM: makeDOMDriver('.main')
});

