const p = 11;
const q = 19;
const mod = p * q;

let seed;

function gcd(a, b) {
    while (a != b) {
        if (a > b) {
            a = a - b;
        } else {
            b = b - a;
        }
    }
    return a;
}

function setSeed(value) {
    if (value == 0) {
        throw new Error("The seed x[0] cannot be 0");
    } else if (value == 1) {
        throw new Error("The seed x[0] cannot be 1");
    } else if (gcd(value, mod) != 1) {
        throw new Error("The seed x[0] must be co-prime to " + M.toString());
    } else {
        seed = value;
        return value;
    }
}

function next() {
    let cachedx = seed;
    cachedx = cachedx * seed;
    cachedx = cachedx % mod;
    seed = cachedx;
    return seed;
}

setSeed(3);
console.log(next());
console.log(next());
console.log(next());
console.log(next());
console.log(next());
console.log(next());
