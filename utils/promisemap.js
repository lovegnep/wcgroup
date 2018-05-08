module.exports = function map(arr, fn, concurrency) {
    // concurrency
    concurrency = concurrency || Infinity;
    if (typeof concurrency !== 'number') {
        throw new TypeError(String(concurrency) + ' is not a number');
    }

    return new Promise(function(resolve, reject) {
        var completed = 0;
        var started = 0;
        var running = 0;
        var results = new Array(arr.length);

        (function replenish() {
            if (completed >= arr.length) {
                return resolve(results);
            }

            while (running < concurrency && started < arr.length) {
                running++;
                started++;

                (function(index) {
                    var cur = arr[index];
                    fn.call(cur, cur, index, arr)
                        .then(function(result) {
                            running--;
                            completed++;
                            results[index] = result;

                            replenish();
                        })
                        .catch(reject);
                })(started - 1);
            }
        })();
    });
};