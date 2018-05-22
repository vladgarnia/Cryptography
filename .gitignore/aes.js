var cipher = function (plaintext, keySchedule) {
    var numberOfBlocks = 4;
    var Nr = keySchedule.length / numberOfBlocks - 1;
    var state = [
        [],
        [],
        [],
        []
    ];
    for (var i = 0; i < 4 * numberOfBlocks; i++) state[i % 4][Math.floor(i / 4)] = plaintext[i];

    state = addRoundKey(state, keySchedule, 0, numberOfBlocks);
    for (var round = 1; round < Nr; round++) {
        state = subBytes(state, numberOfBlocks);
        state = shiftRows(state, numberOfBlocks);
        state = mixColumns(state, numberOfBlocks);
        state = addRoundKey(state, keySchedule, round, numberOfBlocks);
    }

    state = subBytes(state, numberOfBlocks);
    state = shiftRows(state, numberOfBlocks);
    state = addRoundKey(state, keySchedule, Nr, numberOfBlocks);


    var output = new Array(4 * numberOfBlocks);
    for (var i = 0; i < 4 * numberOfBlocks; i++) output[i] = state[i % 4][Math.floor(i / 4)];

    return output;
};

var keyExpansion = function (key) {
    var numberOfBlocks = 4;
    var keyLength = key.length / 4
    var Nr = keyLength + 6;
    var result = new Array(numberOfBlocks * (Nr + 1));
    var temp = new Array(4);

    for (var i = 0; i < keyLength; i++) {
        var r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
        result[i] = r;
    }

    for (var index = keyLength; index < (numberOfBlocks * (Nr + 1)); index++) {
        result[index] = new Array(4);
        for (var counter = 0; counter < 4; counter++) {
            temp[counter] = result[index - 1][counter];
        }
        if (index % keyLength == 0) {

            temp = subWord(rotWord(temp));
            for (var counter = 0; counter < 4; counter++) temp[counter] ^= rCon[index / keyLength][counter];

        } else if (keyLength > 6 && index % keyLength == 4) {
            temp = subWord(temp);
        }
        for (var counter = 0; counter < 4; counter++) result[index][counter] = result[index - keyLength][counter] ^ temp[counter];
    }
    return result;
};

var subBytes = function (s, numberOfBlocks) {
    for (var r = 0; r < 4; r++) {
        for (var c = 0; c < numberOfBlocks; c++) s[r][c] = sBox[s[r][c]];
    }
    return s;
};

var shiftRows = function (s, numberOfBlocks) {
    var t = new Array(4);
    for (var r = 1; r < 4; r++) {
        for (var c = 0; c < 4; c++) t[c] = s[r][(c + r) % numberOfBlocks];
        for (var c = 0; c < 4; c++) s[r][c] = t[c];
    }
    return s;
};

var mixColumns = function (s, numberOfBlocks) {
    for (var c = 0; c < 4; c++) {
        var a = new Array(4);
        var b = new Array(4);
        for (var i = 0; i < 4; i++) {
            a[i] = s[i][c];
            b[i] = s[i][c] & 0x80 ? s[i][c] << 1 ^ 0x011b : s[i][c] << 1;

        }
        s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3]; // 2*a0 + 3*a1 + a2 + a3
        s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3]; // a0 * 2*a1 + 3*a2 + a3
        s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3]; // a0 + a1 + 2*a2 + 3*a3
        s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3]; // 3*a0 + a1 + a2 + 2*a3
    }
    return s;
};

var addRoundKey = function (state, keySchedule, rnd, numberOfBlocks) {
    const roundKey = [];
    for (var r = 0; r < 4; r++) {
        for (var c = 0; c < numberOfBlocks; c++) {
            state[r][c] ^= keySchedule[rnd * 4 + c][r];
            roundKey.push(keySchedule[rnd * 4 + c][r].toString(16));
        }
    }

    console.log(formatRoundKey(roundKey));
    return state;
};

var subWord = function (w) {
    for (var i = 0; i < 4; i++) w[i] = sBox[w[i]];
    return w;
};

var rotWord = function (w) {
    var tmp = w[0];
    for (var i = 0; i < 3; i++) w[i] = w[i + 1];
    w[3] = tmp;
    return w;
};

var sBox = [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf, 0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08, 0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16];

var rCon = [
    [0x00, 0x00, 0x00, 0x00],
    [0x01, 0x00, 0x00, 0x00],
    [0x02, 0x00, 0x00, 0x00],
    [0x04, 0x00, 0x00, 0x00],
    [0x08, 0x00, 0x00, 0x00],
    [0x10, 0x00, 0x00, 0x00],
    [0x20, 0x00, 0x00, 0x00],
    [0x40, 0x00, 0x00, 0x00],
    [0x80, 0x00, 0x00, 0x00],
    [0x1b, 0x00, 0x00, 0x00],
    [0x36, 0x00, 0x00, 0x00]
];

var formatRoundKey = function (roundKey) {
    const result = [];
    result.push(roundKey[0]);
    result.push(roundKey[4]);
    result.push(roundKey[8]);
    result.push(roundKey[12]);

    result.push(roundKey[1]);
    result.push(roundKey[5]);
    result.push(roundKey[9]);
    result.push(roundKey[13])

    result.push(roundKey[2]);
    result.push(roundKey[6]);
    result.push(roundKey[10]);
    result.push(roundKey[14])

    result.push(roundKey[3]);
    result.push(roundKey[7]);
    result.push(roundKey[11]);
    result.push(roundKey[15]);

    return result;
}

var encrypt = function (plaintext, password, numberOfBits) {
    var blockSize = 16;
    if (!(numberOfBits == 128 || numberOfBits == 192 || numberOfBits == 256)) return '';

    plaintext = utf8encode(plaintext);
    password = utf8encode(password);

    var numberOfBytes = numberOfBits / 8; // no bytes in key
    var pwBytes = new Array(numberOfBytes);
    for (var i = 0; i < numberOfBytes; i++) {
        pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
    }

    var key = pwBytes;
    var counterBlock = new Array(blockSize);

    var ctrTxt = '';
    for (var i = 0; i < 8; i++) {
        ctrTxt += String.fromCharCode(counterBlock[i]);
    }

    var keySchedule = keyExpansion(key);


    var blockCount = Math.ceil(plaintext.length / blockSize);
    var ciphertxt = new Array(blockCount);
    for (var b = 0; b < blockCount; b++) {
        for (var c = 0; c < 4; c++) {
            counterBlock[15 - c] = (b >>> c * 8) & 0xff;
        }
        for (var c = 0; c < 4; c++) {
            counterBlock[15 - c - 4] = (b / 0x100000000 >>> c * 8);
        }

        var cipherCntr = cipher(counterBlock, keySchedule);
        var blockLength = b < blockCount - 1 ? blockSize : (plaintext.length - 1) % blockSize + 1;
        var cipherChar = new Array(blockLength);

        for (var i = 0; i < blockLength; i++) { // -- xor plaintext with ciphered counter char-by-char --
            cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b * blockSize + i);
            cipherChar[i] = String.fromCharCode(cipherChar[i]);
        }
        ciphertxt[b] = cipherChar.join('');
    }

    var ciphertext = ctrTxt + ciphertxt.join('');
    ciphertext = base64encode(ciphertext); // encode in base64
    return ciphertext;
};


var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";


base64encode = function (str, utf8encode) {
    utf8encode = (typeof utf8encode == 'undefined') ? false : utf8encode;
    var o1, o2, o3, bits, h1, h2, h3, h4, e = [],
        pad = '',
        c, plain, coded;
    var b64 = code;

    plain = utf8encode ? str.encodeUTF8() : str;

    c = plain.length % 3; // pad string to length of multiple of 3
    if (c > 0) {
        while (c++ < 3) {
            pad += '=';
            plain += '\0';
        }
    }
    // note: doing padding here saves us doing special-case packing for trailing 1 or 2 chars
    for (c = 0; c < plain.length; c += 3) { // pack three octets into four hexets
        o1 = plain.charCodeAt(c);
        o2 = plain.charCodeAt(c + 1);
        o3 = plain.charCodeAt(c + 2);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        // use hextets to index into code string
        e[c / 3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    }
    coded = e.join(''); // join() is far faster than repeated string concatenation in IE
    // replace 'A's from padded nulls with '='s
    coded = coded.slice(0, coded.length - pad.length) + pad;

    return coded;
};


base64decode = function (str, utf8decode) {
    utf8decode = (typeof utf8decode == 'undefined') ? false : utf8decode;
    var o1, o2, o3, h1, h2, h3, h4, bits, d = [],
        plain, coded;
    var b64 = code;

    coded = utf8decode ? str.decodeUTF8() : str;

    for (var c = 0; c < coded.length; c += 4) { // unpack four hexets into three octets
        h1 = b64.indexOf(coded.charAt(c));
        h2 = b64.indexOf(coded.charAt(c + 1));
        h3 = b64.indexOf(coded.charAt(c + 2));
        h4 = b64.indexOf(coded.charAt(c + 3));

        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

        o1 = bits >>> 16 & 0xff;
        o2 = bits >>> 8 & 0xff;
        o3 = bits & 0xff;

        d[c / 4] = String.fromCharCode(o1, o2, o3);
        // check for padding
        if (h4 == 0x40) d[c / 4] = String.fromCharCode(o1, o2);
        if (h3 == 0x40) d[c / 4] = String.fromCharCode(o1);
    }
    plain = d.join('');
    return utf8decode ? plain.decodeUTF8() : plain;
};


utf8encode = function (strUni) {
    var strUtf = strUni.replace(/[\u0080-\u07ff]/g,

        function (c) {
            var cc = c.charCodeAt(0);
            return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
        });
    strUtf = strUtf.replace(/[\u0800-\uffff]/g, // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz

        function (c) {
            var cc = c.charCodeAt(0);
            return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
        });

    return strUtf;
};


utf8decode = function (strUtf) {
    var strUni = strUtf.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, // 3-byte chars

        function (c) {
            var cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f);
            return String.fromCharCode(cc);
        });

    strUni = strUni.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, // 2-byte chars

        function (c) {
            var cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
            return String.fromCharCode(cc);
        });

    return strUni;
};

var password = 'Thats my Kung Fu';
var plaintext = 'my code';

var ciphertext = encrypt(plaintext, password, 128);
console.log(ciphertext);
