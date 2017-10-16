const input = document.querySelector('input');

function mockReq(name) {
  return Rx.Observable
    .defer(() => {
      return new Promise((resolve, reject) => {
        const val = parseInt(Math.random() * 4000);
        const t = parseInt(Math.random() * 4000);

        console.log(`mock: val=${val}`);

        if (val < 1000) {
          // 500
          reject('server error');
        } else if (val >= 1000 && val < 2000) {
          // retry
          reject('time out');
        } else if (val >= 2000 && val < 3000) {
          // 488
          reject('488');
        } else {
          setTimeout(() => {
            resolve(`result ${name}`);
          }, t);
        }
      });
    })
    .retryWhen(errors => {
      return errors.filter(err => {
        if (err === 'server error') console.log('server error');
        return err !== 'server error';
      }).delayWhen(err => {
        if (err === '488') {
          return Rx.Observable.interval(1000);
        } else {
          return Rx.Observable.interval(0);
        }
      }).scan(
        (acc, cur) => acc += 1,
        0
      ).do(
        (acc) => console.log(`retry ${acc}`)
      ).take(3);
    });
}


let source = Rx.Observable
  .fromEvent(input, 'input')
  .debounceTime(200)
  .distinctUntilChanged()
  .filter(e => !!e.target.value)
  .switchMap(e => mockReq(e.target.value));

source.subscribe(
    r => console.log(`success: ${r}`),
    err => console.log(`final error handle: ${err}`)
);
