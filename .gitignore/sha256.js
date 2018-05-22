function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
};

let sha256hash = function (plaintext) {
    let maxWord = Math.pow(2, 32);
    let result = '';

    let words = [];
    let messageLength = plaintext.length * 8;

    let hash = [];
    let constants = [];
    let primeCounter = 0;

    let isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (let i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (Math.pow(candidate, .5) * maxWord) | 0;
            constants[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
        }
    }

    plaintext += '\x80'; // Append '1' bit (plus zero padding)
    while (plaintext.length % 64 - 56) {
        plaintext += '\x00';
    }

    for (let i = 0; i < plaintext.length; i++) {
        let char = plaintext.charCodeAt(i);
        if (char >> 8) return;
        words[i >> 2] |= char << ((3 - i) % 4) * 8;
    }
    words.push((messageLength / maxWord) | 0);
    words.push(messageLength)

    // process each chunk
    for (let j = 0; j < words.length;) {
        let word = words.slice(j, j += 16);
        let oldHash = hash;

        hash = hash.slice(0, 8);

        for (i = 0; i < 64; i++) {
            let i2 = i + j;
            let w15 = word[i - 15];
            let w2 = word[i - 2];

            // Iterate
            let a = hash[0];
            let e = hash[4];
            let temp1 =
                hash[7] + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
                ((e & hash[5]) ^ ((~e) & hash[6])) + constants[i] + (word[i] = (i < 16) ?
                    word[i] :
                    (word[i - 16] + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                        word[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0);

            let temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
                ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

            hash = [(temp1 + temp2) | 0].concat(hash);
            hash[4] = (hash[4] + temp1) | 0;
        }

        for (let i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }

    for (let i = 0; i < 8; i++) {
        for (let j = 3; j + 1; j--) {
            let b = (hash[i] >> (j * 8)) & 255;
            result += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }
    return result;
};

console.log(sha256hash('vlad1993').toUpperCase());
