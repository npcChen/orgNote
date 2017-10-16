import {Observable} from 'rxjs';
import {div, input} from '@cycle/dom';
import isolate from '@cycle/isolate';

// indent
function indent(domSource) {
  return {
    change$: domSource
      .select('.input')
      .events('input')
      .map(e => e.target.value)
  };
}

// model
function model(props$, actions) {

  const initVal$ = props$.take(1);
  const newVal$ = actions.change$.map(value => ({value}));

  return Observable
    .merge(newVal$, initVal$)
    .shareReplay(1);
}

// view
function view(state$) {
  return state$.map(({value}) => {
    return div([
      'len: ' + value,
        input('.input', {attrs: {type: 'range', min: 40, max: 140, value: value}})
    ]);
  });
}


function main(sources) {
  const actions = indent(sources.DOM);
  const state$ = model(sources.props, actions);
  const vdom$ = view(state$);

  return {
    DOM: vdom$
  };
}

function isolateMain(sources) {
  return isolate(main)(sources);
};

export default isolateMain;

