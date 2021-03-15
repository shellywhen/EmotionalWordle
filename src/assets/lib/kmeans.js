"use strict";
exports.__esModule = true;
exports.kmeans = void 0;
var MAX = 10000;
function init(len, val, vect) {
    vect = vect || [];
    for (var i = 0; i < len; i++) {
        vect[i] = val;
    }
    return vect;
}
function kmeans(data, k, init_cent, max_it) {
    var cents = [];
    var indexes = [];
    var cent_moved = false;
    var iterations = max_it || MAX;
    var count = [];
    if (!init_cent) {
        var def_indexes = [];
        var i = 0;
        while (cents.length < k) {
            var idx = Math.floor(Math.random() * data.length);
            if (!def_indexes[idx]) {
                def_indexes[idx] = true;
                cents[i++] = data[idx];
            }
        }
    }
    else if (init_cent === "kmeans") {
        cents = Cluster.k_means(data, k);
    }
    else if (init_cent === "kmeans++") {
        cents = Cluster.k_means_pp(data, k);
    }
    else {
        cents = Array.from(init_cent);
    }
    do {
        init(k, 0, count);
        // For each value in data, find nearest centroid (Custom, multidimensional or one-dimensional)
        for (var i in data) {
            var min = Infinity;
            var idx = 0;
            for (var j = 0; j < k; j++) {
                var dist = data[0].length > 0
                    ? Distance.euclideanDist(data[i], cents[j])
                    : Math.abs(data[i][0] - cents[j][0]);
                if (dist <= min) {
                    min = dist;
                    idx = j;
                }
            }
            indexes[i] = idx; // Idx of centroid
            count[idx]++; // Num values for centroid
        }
        // Recalculate centroids
        var sum = [];
        var old = [];
        if (data[0].length > 0) {
            for (var j = 0; j < k; j++) {
                sum[j] = init(data[0].length, 0, sum[j]);
                old[j] = cents[j];
            }
        }
        else {
            for (var j = 0; j < k; j++) {
                sum[j] = 0;
                old[j] = cents[j];
            }
        }
        // If multidimensional, sum values & accumulate value on the centroid for current vector for each centroid
        if (data[0].length > 0) {
            for (var j = 0; j < k; j++) {
                cents[j] = [];
            }
            for (var i in data) {
                for (var h = 0; h < data[0].length; h++) {
                    sum[indexes[i]][h] += data[i][h]; // Sum values for current centroid + Current vector
                }
            }
            // Calculate the avg for each centroid
            cent_moved = true;
            for (var j = 0; j < k; j++) {
                /*
                sum[j] |  Sum of centroid values
                old[j] | Old centroid value
                count[j] | Num elements for centroid
                */
                var cent_j = cents[j]; // Current centroid
                for (var h = 0; h < data[0].length; h++) {
                    cent_j[h] = sum[j][h] / count[j] || 0; // Avg from new centroid
                }
                if (cent_moved) {
                    for (var h = 0; h < data[0].length; h++) {
                        if (old[j][h] != cent_j[h]) {
                            cent_moved = false;
                            break;
                        }
                    }
                }
            }
        }
        // If one-dimensional, sum values & for each centroid, calculate avg, then determine if centroids moved
        else {
            for (var i in data) {
                var idx = indexes[i];
                sum[idx] += data[i];
            }
            for (var j = 0; j < k; j++) {
                cents[j] = [sum[j] / count[j]] || [0];
            }
            cent_moved = true;
            for (var j = 0; j < k; j++) {
                if (old[j] != cents[j]) {
                    cent_moved = false;
                    break;
                }
            }
        }
        cent_moved = cent_moved || --iterations <= 0;
    } while (!cent_moved);
    var k_means_obj = {
        iterations: (max_it || MAX) - iterations,
        k: k,
        indexes: indexes,
        centroids: cents
    };
    return k_means_obj;
}
exports.kmeans = kmeans;
var Cluster = /** @class */ (function () {
    function Cluster() {
    }
    // K-means initial centroid selection
    Cluster.k_means = function (data, k) {
        var cents = [];
        var t = k << 2;
        var map = new Map();
        while (cents.length < k && t-- > 0) {
            var d = data[Math.floor(Math.random() * data.length)];
            var key = data[0].length > 0 ? d.join("_") : "" + d;
            if (!map.get(key)) {
                map.set(key, true);
                cents.push(d);
            }
        }
        if (cents.length < k) {
            throw Error("Failed to initialize clusters");
        }
        else
            return cents;
    };
    // K-means++ initial centroid selection
    Cluster.k_means_pp = function (data, k) {
        var distance = data[0].length
            ? Distance.euclideanDist
            : Distance.dist;
        var cents = [];
        var map = new Map();
        // Initial random centroid
        var c = data[Math.floor(Math.random() * data.length)];
        cents.push(c);
        map.set(data[0].length > 0 ? c.join("_") : "" + c, true);
        // Get next centroids
        while (cents.length < k) {
            // Find min distances between current centroids and data points
            var distances = [];
            var probs = [];
            var d_sum = 0;
            for (var i in data) {
                var min = Infinity;
                for (var j in cents) {
                    var dist = distance(data[i], cents[j]);
                    if (dist <= min)
                        min = dist;
                }
                distances[i] = min;
            }
            // Sum min distances
            for (var i in data) {
                d_sum += distances[i];
            }
            // Probabilities/cumulative prob
            for (var i in data) {
                probs[i] = { i: i, v: data[i], pr: distances[i] / d_sum, cs: 0 };
            }
            probs.sort(function (a, b) { return a.pr - b.pr; });
            // Cumulative probs
            probs[0].cs = probs[0].pr;
            for (var i = 1; i < data.length; i++) {
                probs[i].cs = probs[i - 1].cs + probs[i].pr;
            }
            // Gets items where cum sum >= random num
            var rnd = Math.random();
            var idx = 0;
            while (idx < data.length - 1 && probs[idx++].cs < rnd)
                ;
            cents.push(probs[idx - 1].v);
        }
        return cents;
    };
    return Cluster;
}());
var Distance = /** @class */ (function () {
    function Distance() {
    }
    // Absolute distance between two values
    // d(x, y, z) = z ? || x - y || : || x - y || * || x - y ||
    Distance.dist = function (x, y, sqrt) {
        var d = Math.abs(x - y);
        return sqrt ? d : d * d;
    };
    // The "ordinary" straight-line distance between two points in Euclidean space
    // ed((x1, y1), (x2, y2)) = || (x1, y1) – (x2, y2) ||
    Distance.euclideanDist = function (x, y) {
        var sum = 0;
        for (var i in x) {
            var d = (x[i] || 0) - (y[i] || 0);
            sum += d * d;
        }
        return sum;
    };
    // The distance between two points measured along axes at right angles
    // md((x1, y1), (x2, y2)) = | x1 – x2 | + | y1 – y2 |
    Distance.manhattanDist = function (x, y) {
        var sum = 0;
        var d = 0;
        for (var i in x) {
            d = (x[i] || 0) - (y[i] || 0);
            sum += d >= 0 ? d : -d;
        }
        return sum;
    };
    return Distance;
}());
