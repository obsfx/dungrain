(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dungrain = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// A library of seedable RNGs implemented in Javascript.
//
// Usage:
//
// var seedrandom = require('seedrandom');
// var random = seedrandom(1); // or any seed.
// var x = random();       // 0 <= x < 1.  Every bit is random.
// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
// Period: ~2^116
// Reported to pass all BigCrush tests.
var alea = require('./lib/alea');

// xor128, a pure xor-shift generator by George Marsaglia.
// Period: 2^128-1.
// Reported to fail: MatrixRank and LinearComp.
var xor128 = require('./lib/xor128');

// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
// Period: 2^192-2^32
// Reported to fail: CollisionOver, SimpPoker, and LinearComp.
var xorwow = require('./lib/xorwow');

// xorshift7, by François Panneton and Pierre L'ecuyer, takes
// a different approach: it adds robustness by allowing more shifts
// than Marsaglia's original three.  It is a 7-shift generator
// with 256 bits, that passes BigCrush with no systmatic failures.
// Period 2^256-1.
// No systematic BigCrush failures reported.
var xorshift7 = require('./lib/xorshift7');

// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
// very long period that also adds a Weyl generator. It also passes
// BigCrush with no systematic failures.  Its long period may
// be useful if you have many generators and need to avoid
// collisions.
// Period: 2^4128-2^32.
// No systematic BigCrush failures reported.
var xor4096 = require('./lib/xor4096');

// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
// number generator derived from ChaCha, a modern stream cipher.
// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
// Period: ~2^127
// No systematic BigCrush failures reported.
var tychei = require('./lib/tychei');

// The original ARC4-based prng included in this library.
// Period: ~2^1600
var sr = require('./seedrandom');

sr.alea = alea;
sr.xor128 = xor128;
sr.xorwow = xorwow;
sr.xorshift7 = xorshift7;
sr.xor4096 = xor4096;
sr.tychei = tychei;

module.exports = sr;

},{"./lib/alea":3,"./lib/tychei":4,"./lib/xor128":5,"./lib/xor4096":6,"./lib/xorshift7":7,"./lib/xorwow":8,"./seedrandom":9}],3:[function(require,module,exports){
// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -

// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.



(function(global, module, define) {

function Alea(seed) {
  var me = this, mash = Mash();

  me.next = function() {
    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
    me.s0 = me.s1;
    me.s1 = me.s2;
    return me.s2 = t - (me.c = t | 0);
  };

  // Apply the seeding algorithm from Baagoe.
  me.c = 1;
  me.s0 = mash(' ');
  me.s1 = mash(' ');
  me.s2 = mash(' ');
  me.s0 -= mash(seed);
  if (me.s0 < 0) { me.s0 += 1; }
  me.s1 -= mash(seed);
  if (me.s1 < 0) { me.s1 += 1; }
  me.s2 -= mash(seed);
  if (me.s2 < 0) { me.s2 += 1; }
  mash = null;
}

function copy(f, t) {
  t.c = f.c;
  t.s0 = f.s0;
  t.s1 = f.s1;
  t.s2 = f.s2;
  return t;
}

function impl(seed, opts) {
  var xg = new Alea(seed),
      state = opts && opts.state,
      prng = xg.next;
  prng.int32 = function() { return (xg.next() * 0x100000000) | 0; }
  prng.double = function() {
    return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
  };
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

function Mash() {
  var n = 0xefc8249d;

  var mash = function(data) {
    data = String(data);
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}


if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.alea = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],4:[function(require,module,exports){
// A Javascript implementaion of the "Tyche-i" prng algorithm by
// Samuel Neves and Filipe Araujo.
// See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var b = me.b, c = me.c, d = me.d, a = me.a;
    b = (b << 25) ^ (b >>> 7) ^ c;
    c = (c - d) | 0;
    d = (d << 24) ^ (d >>> 8) ^ a;
    a = (a - b) | 0;
    me.b = b = (b << 20) ^ (b >>> 12) ^ c;
    me.c = c = (c - d) | 0;
    me.d = (d << 16) ^ (c >>> 16) ^ a;
    return me.a = (a - b) | 0;
  };

  /* The following is non-inverted tyche, which has better internal
   * bit diffusion, but which is about 25% slower than tyche-i in JS.
  me.next = function() {
    var a = me.a, b = me.b, c = me.c, d = me.d;
    a = (me.a + me.b | 0) >>> 0;
    d = me.d ^ a; d = d << 16 ^ d >>> 16;
    c = me.c + d | 0;
    b = me.b ^ c; b = b << 12 ^ d >>> 20;
    me.a = a = a + b | 0;
    d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
    me.c = c = c + d | 0;
    b = b ^ c;
    return me.b = (b << 7 ^ b >>> 25);
  }
  */

  me.a = 0;
  me.b = 0;
  me.c = 2654435769 | 0;
  me.d = 1367130551;

  if (seed === Math.floor(seed)) {
    // Integer seed.
    me.a = (seed / 0x100000000) | 0;
    me.b = seed | 0;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 20; k++) {
    me.b ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.a = f.a;
  t.b = f.b;
  t.c = f.c;
  t.d = f.d;
  return t;
};

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.tychei = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],5:[function(require,module,exports){
// A Javascript implementaion of the "xor128" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;

  // Set up generator function.
  me.next = function() {
    var t = me.x ^ (me.x << 11);
    me.x = me.y;
    me.y = me.z;
    me.z = me.w;
    return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
  };

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor128 = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],6:[function(require,module,exports){
// A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
//
// This fast non-cryptographic random number generator is designed for
// use in Monte-Carlo algorithms. It combines a long-period xorshift
// generator with a Weyl generator, and it passes all common batteries
// of stasticial tests for randomness while consuming only a few nanoseconds
// for each prng generated.  For background on the generator, see Brent's
// paper: "Some long-period random number generators using shifts and xors."
// http://arxiv.org/pdf/1004.3115v1.pdf
//
// Usage:
//
// var xor4096 = require('xor4096');
// random = xor4096(1);                        // Seed with int32 or string.
// assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
// assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
//
// For nonzero numeric keys, this impelementation provides a sequence
// identical to that by Brent's xorgens 3 implementaion in C.  This
// implementation also provides for initalizing the generator with
// string seeds, or for saving and restoring the state of the generator.
//
// On Chrome, this prng benchmarks about 2.1 times slower than
// Javascript's built-in Math.random().

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    var w = me.w,
        X = me.X, i = me.i, t, v;
    // Update Weyl generator.
    me.w = w = (w + 0x61c88647) | 0;
    // Update xor generator.
    v = X[(i + 34) & 127];
    t = X[i = ((i + 1) & 127)];
    v ^= v << 13;
    t ^= t << 17;
    v ^= v >>> 15;
    t ^= t >>> 12;
    // Update Xor generator array state.
    v = X[i] = v ^ t;
    me.i = i;
    // Result is the combination.
    return (v + (w ^ (w >>> 16))) | 0;
  };

  function init(me, seed) {
    var t, v, i, j, w, X = [], limit = 128;
    if (seed === (seed | 0)) {
      // Numeric seeds initialize v, which is used to generates X.
      v = seed;
      seed = null;
    } else {
      // String seeds are mixed into v and X one character at a time.
      seed = seed + '\0';
      v = 0;
      limit = Math.max(limit, seed.length);
    }
    // Initialize circular array and weyl value.
    for (i = 0, j = -32; j < limit; ++j) {
      // Put the unicode characters into the array, and shuffle them.
      if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
      // After 32 shuffles, take v as the starting w value.
      if (j === 0) w = v;
      v ^= v << 10;
      v ^= v >>> 15;
      v ^= v << 4;
      v ^= v >>> 13;
      if (j >= 0) {
        w = (w + 0x61c88647) | 0;     // Weyl.
        t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
        i = (0 == t) ? i + 1 : 0;     // Count zeroes.
      }
    }
    // We have detected all zeroes; make the key nonzero.
    if (i >= 128) {
      X[(seed && seed.length || 0) & 127] = -1;
    }
    // Run the generator 512 times to further mix the state before using it.
    // Factoring this as a function slows the main generator, so it is just
    // unrolled here.  The weyl generator is not advanced while warming up.
    i = 127;
    for (j = 4 * 128; j > 0; --j) {
      v = X[(i + 34) & 127];
      t = X[i = ((i + 1) & 127)];
      v ^= v << 13;
      t ^= t << 17;
      v ^= v >>> 15;
      t ^= t >>> 12;
      X[i] = v ^ t;
    }
    // Storing state as object members is faster than using closure variables.
    me.w = w;
    me.X = X;
    me.i = i;
  }

  init(me, seed);
}

function copy(f, t) {
  t.i = f.i;
  t.w = f.w;
  t.X = f.X.slice();
  return t;
};

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.X) copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor4096 = impl;
}

})(
  this,                                     // window object or global
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);

},{}],7:[function(require,module,exports){
// A Javascript implementaion of the "xorshift7" algorithm by
// François Panneton and Pierre L'ecuyer:
// "On the Xorgshift Random Number Generators"
// http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    // Update xor generator.
    var X = me.x, i = me.i, t, v, w;
    t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
    t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
    t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
    t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
    t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
    X[i] = v;
    me.i = (i + 1) & 7;
    return v;
  };

  function init(me, seed) {
    var j, w, X = [];

    if (seed === (seed | 0)) {
      // Seed state array using a 32-bit integer.
      w = X[0] = seed;
    } else {
      // Seed state using a string.
      seed = '' + seed;
      for (j = 0; j < seed.length; ++j) {
        X[j & 7] = (X[j & 7] << 15) ^
            (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
      }
    }
    // Enforce an array length of 8, not all zeroes.
    while (X.length < 8) X.push(0);
    for (j = 0; j < 8 && X[j] === 0; ++j);
    if (j == 8) w = X[7] = -1; else w = X[j];

    me.x = X;
    me.i = 0;

    // Discard an initial 256 values.
    for (j = 256; j > 0; --j) {
      me.next();
    }
  }

  init(me, seed);
}

function copy(f, t) {
  t.x = f.x.slice();
  t.i = f.i;
  return t;
}

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.x) copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorshift7 = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);


},{}],8:[function(require,module,exports){
// A Javascript implementaion of the "xorwow" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var t = (me.x ^ (me.x >>> 2));
    me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
    return (me.d = (me.d + 362437 | 0)) +
       (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
  };

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;
  me.v = 0;

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    if (k == strseed.length) {
      me.d = me.x << 10 ^ me.x >>> 4;
    }
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  t.v = f.v;
  t.d = f.d;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorwow = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],9:[function(require,module,exports){
/*
Copyright 2019 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function (global, pool, math) {
//
// The following constants are related to IEEE 754 limits.
//

var width = 256,        // each RC4 output is 0 <= x < 256
    chunks = 6,         // at least six RC4 outputs for each double
    digits = 52,        // there are 52 significant digits in a double
    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
    startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,
    nodecrypto;         // node.js crypto module, initialized at the bottom.

//
// seedrandom()
// This is the seedrandom function described above.
//
function seedrandom(seed, options, callback) {
  var key = [];
  options = (options == true) ? { entropy: true } : (options || {});

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    options.entropy ? [seed, tostring(pool)] :
    (seed == null) ? autoseed() : seed, 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.
  var prng = function() {
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  prng.int32 = function() { return arc4.g(4) | 0; }
  prng.quick = function() { return arc4.g(4) / 0x100000000; }
  prng.double = prng;

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Calling convention: what to return as a function of prng, seed, is_math.
  return (options.pass || callback ||
      function(prng, seed, is_math_call, state) {
        if (state) {
          // Load the arc4 state from the given state if it has an S array.
          if (state.S) { copy(state, arc4); }
          // Only provide the .state method if requested via options.state.
          prng.state = function() { return copy(arc4, {}); }
        }

        // If called as a method of Math (Math.seedrandom()), mutate
        // Math.random because that is how seedrandom.js has worked since v1.0.
        if (is_math_call) { math[rngname] = prng; return seed; }

        // Otherwise, it is a newer calling convention, so return the
        // prng directly.
        else return prng;
      })(
  prng,
  shortseed,
  'global' in options ? options.global : (this == math),
  options.state);
}

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability, the function call below automatically
    // discards an initial batch of values.  This is called RC4-drop[256].
    // See http://google.com/search?q=rsa+fluhrer+response&btnI
  })(width);
}

//
// copy()
// Copies internal state of ARC4 to or from a plain object.
//
function copy(f, t) {
  t.i = f.i;
  t.j = f.j;
  t.S = f.S.slice();
  return t;
};

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj), prop;
  if (depth && typ == 'object') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto and Node crypto
// module if available.
//
function autoseed() {
  try {
    var out;
    if (nodecrypto && (out = nodecrypto.randomBytes)) {
      // The use of 'out' to remember randomBytes makes tight minified code.
      out = out(width);
    } else {
      out = new Uint8Array(width);
      (global.crypto || global.msCrypto).getRandomValues(out);
    }
    return tostring(out);
  } catch (e) {
    var browser = global.navigator,
        plugins = browser && browser.plugins;
    return [+new Date, global, plugins, global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to interfere with deterministic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

//
// Nodejs and AMD support: export the implementation as a module using
// either convention.
//
if ((typeof module) == 'object' && module.exports) {
  module.exports = seedrandom;
  // When in node.js, try using crypto package for autoseeding.
  try {
    nodecrypto = require('crypto');
  } catch (ex) {}
} else if ((typeof define) == 'function' && define.amd) {
  define(function() { return seedrandom; });
} else {
  // When included as a plain script, set up Math.seedrandom global.
  math['seed' + rngname] = seedrandom;
}


// End anonymous scope, and pass initial values.
})(
  // global: `self` in browsers (including strict mode and web workers),
  // otherwise `this` in Node and other environments
  (typeof self !== 'undefined') ? self : this,
  [],     // pool: entropy pool starts empty
  Math    // math: package containing random, pow, and seedrandom
);

},{"crypto":1}],10:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1 = __importDefault(require("./modules/Main"));
module.exports = Main_1.default;

},{"./modules/Main":13}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Interfaces;
(function (Interfaces) {
    var Direction;
    (function (Direction) {
        Direction[Direction["VERTICAL"] = 0] = "VERTICAL";
        Direction[Direction["HORIZONTAL"] = 1] = "HORIZONTAL";
    })(Direction = Interfaces.Direction || (Interfaces.Direction = {}));
})(Interfaces = exports.Interfaces || (exports.Interfaces = {}));

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InputErrorHandler = function (args) {
    var errors = [];
    if (typeof args == 'undefined') {
        errors.push('please pass necessary arguments. [ iterationCount, column, row, indexMap ]');
    }
    else {
        /* type checks */
        if (typeof args.seed != 'string' && typeof args.seed != 'undefined') {
            errors.push('seed value must be a string.');
        }
        if (typeof args.iterationCount != 'number') {
            errors.push('iterationCount value must be a number.');
        }
        if (typeof args.column != 'number') {
            errors.push('column value must be a number.');
        }
        if (typeof args.row != 'number') {
            errors.push('row value must be a number.');
        }
        if (typeof args.minimumWHRatio != 'number' && typeof args.minimumWHRatio != 'undefined') {
            errors.push('minimumWHRatio value must be a number.');
        }
        if (typeof args.maximumWHRatio != 'number' && typeof args.maximumWHRatio != 'undefined') {
            errors.push('maximumWHRatio value must be a number.');
        }
        if (typeof args.minimumChunkWidth != 'number' && typeof args.minimumChunkWidth != 'undefined') {
            errors.push('minimumChunkWidth value must be a number.');
        }
        if (typeof args.minimumChunkHeight != 'number' && typeof args.minimumChunkHeight != 'undefined') {
            errors.push('minimumChunkHeight value must be a number.');
        }
        if (typeof args.indexMap != 'undefined') {
            if (typeof args.indexMap.Wall != 'number') {
                errors.push('indexMap.Wall value must be a number.');
            }
            if (typeof args.indexMap.Path != 'number') {
                errors.push('indexMap.Path value must be a number.');
            }
            if (typeof args.indexMap.Room != 'number') {
                errors.push('indexMap.Room value must be a number.');
            }
            if (typeof args.indexMap.Empty != 'number') {
                errors.push('indexMap.Empty value must be a number.');
            }
        }
        else {
            errors.push('indexMap object couldn\'t found. you must define "Wall, Path, Room, Empty" indices in indexMap object.');
        }
        /* zero checks */
        if (args.iterationCount < 0) {
            errors.push('iterationCount can\'t be less than zero.');
        }
        if (args.column < 0) {
            errors.push('column can\'t be less than zero.');
        }
        if (args.row < 0) {
            errors.push('row can\'t be less than zero.');
        }
        if (typeof args.minimumWHRatio == 'number') {
            if (args.minimumWHRatio < 0) {
                errors.push('minimumWHRatiocan\'t be less than zero.');
            }
        }
        if (typeof args.maximumWHRatio == 'number') {
            if (args.maximumWHRatio < 0) {
                errors.push('maximumWHRatio can\'t be less than zero.');
            }
        }
        if (typeof args.minimumChunkWidth == 'number') {
            if (args.minimumChunkWidth < 0) {
                errors.push('minimumChunkWidth can\'t be less than zero.');
            }
        }
        if (typeof args.minimumChunkHeight == 'number') {
            if (args.minimumChunkHeight < 0) {
                errors.push('minimumChunkHeight can\'t be less than zero.');
            }
        }
        /* ratio check */
        if (args.minimumWHRatio && args.maximumWHRatio) {
            if (args.minimumWHRatio > args.maximumWHRatio) {
                errors.push('minimumWHRatio can\'t be greater than maximumWHRatio.');
            }
        }
    }
    return errors;
};
exports.default = InputErrorHandler;

},{}],13:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var interfaces_namespace_1 = require("../interfaces.namespace");
var seedrandom_1 = __importDefault(require("seedrandom"));
var Node_1 = __importDefault(require("./Node"));
var Room_1 = __importDefault(require("./Room"));
var Path_1 = __importDefault(require("./Path"));
var InputErrorHandler_1 = __importDefault(require("./InputErrorHandler"));
var Main = /** @class */ (function () {
    function Main(args) {
        var errors = InputErrorHandler_1.default(args);
        if (errors.length > 0) {
            throw new Error('dungrain error: please check your arguments. \n' + errors.join('\n'));
        }
        this.seed = args.seed || Date.now().toString(16);
        this.iterationCount = args.iterationCount;
        this.column = args.column;
        this.row = args.row;
        this.minimumWHRatio = args.minimumWHRatio || 0.5;
        this.maximumWHRatio = args.maximumWHRatio || 2.0;
        this.minimumChunkWidth = args.minimumChunkWidth || 8;
        this.minimumChunkHeight = args.minimumChunkHeight || 8;
        this.indexMap = args.indexMap;
        this.RNG = seedrandom_1.default(this.seed);
        this.arrayMap = this.createEmptyArrayMap(this.column, this.row);
        this.root = new Node_1.default({
            x: 0,
            y: 0,
            w: this.column,
            h: this.row,
            minRatio: this.minimumWHRatio,
            maxRatio: this.maximumWHRatio,
            minWidth: this.minimumChunkWidth,
            minHeight: this.minimumChunkHeight
        }, this.RNG);
        this.root.split(this.iterationCount);
        this.root.generateRoomChunks();
        this.root.createPathChunks();
        this.allFloors = [];
        this.roomChunks = this.root.getRoomChunks();
        this.pathChunks = this.root.getPathChunks();
        this.rooms = [];
        this.paths = [];
        this.constructArrayMap();
    }
    Main.prototype.createEmptyArrayMap = function (col, row) {
        var arrayMap = [];
        for (var i = 0; i < row; i++) {
            arrayMap.push([]);
            for (var j = 0; j < col; j++) {
                arrayMap[i].push(this.indexMap.Empty);
            }
        }
        return arrayMap;
    };
    Main.prototype.placeWalls = function () {
        var _this = this;
        this.roomChunks.forEach(function (chunk) {
            var yStart = (chunk.h > 3) ? chunk.y : chunk.y - 1;
            var yTarget = (chunk.h > 3) ? chunk.y + chunk.h : chunk.y + chunk.h + 1;
            var xStart = (chunk.w > 3) ? chunk.x : chunk.x - 1;
            var xTarget = (chunk.w > 3) ? chunk.x + chunk.w : chunk.x + chunk.w + 1;
            for (var i = yStart; i < yTarget; i++) {
                for (var j = xStart; j < xTarget; j++) {
                    if (i > -1 && i < _this.row && j > -1 && j < _this.column) {
                        _this.arrayMap[i][j] = _this.indexMap.Wall;
                    }
                }
            }
        });
        this.pathChunks.forEach(function (path) {
            for (var i = path.y1 - 1; i < path.y1 + path.h + 1; i++) {
                for (var j = path.x1 - 1; j < path.x1 + path.w + 1; j++) {
                    if (i > -1 && i < _this.row && j > -1 && j < _this.column) {
                        _this.arrayMap[i][j] = _this.indexMap.Wall;
                    }
                }
            }
        });
    };
    Main.prototype.placePaths = function () {
        var _this = this;
        this.pathChunks.forEach(function (path) {
            var startPoint = null;
            var floors = [];
            for (var i = path.y1; i < path.y1 + path.h; i++) {
                for (var j = path.x1; j < path.x1 + path.w; j++) {
                    if (i == 0 || i == _this.row - 1 || j == 0 || j == _this.column - 1) {
                        _this.arrayMap[i][j] = _this.indexMap.Wall;
                    }
                    else {
                        if (startPoint == null) {
                            startPoint = {
                                x: j,
                                y: i
                            };
                        }
                        floors.push({ x: j, y: i });
                        _this.arrayMap[i][j] = _this.indexMap.Path;
                        _this.allFloors.push({ x: j, y: i, type: _this.indexMap.Path });
                    }
                }
            }
            if (startPoint != null) {
                _this.paths.push(new Path_1.default({
                    startPoint: startPoint,
                    floors: floors,
                    direction: (path.w == _this.root.pathWidth) ?
                        interfaces_namespace_1.Interfaces.Direction.VERTICAL :
                        interfaces_namespace_1.Interfaces.Direction.HORIZONTAL,
                    width: (path.w == _this.root.pathWidth) ?
                        path.h :
                        path.w
                }));
            }
        });
    };
    Main.prototype.placeRooms = function () {
        var _this = this;
        this.roomChunks.forEach(function (chunk) {
            var yStart = (chunk.h > 3) ? chunk.y + 1 : chunk.y;
            var yTarget = (chunk.h > 3) ? chunk.y + chunk.h - 1 : chunk.y + chunk.h;
            var xStart = (chunk.w > 3) ? chunk.x + 1 : chunk.x;
            var xTarget = (chunk.w > 3) ? chunk.x + chunk.w - 1 : chunk.x + chunk.w;
            var roomTopLeft = null;
            var floors = [];
            for (var i = yStart; i < yTarget; i++) {
                for (var j = xStart; j < xTarget; j++) {
                    if (i == 0 || i == _this.row - 1 || j == 0 || j == _this.column - 1) {
                        _this.arrayMap[i][j] = _this.indexMap.Wall;
                    }
                    else {
                        if (roomTopLeft == null) {
                            roomTopLeft = {
                                x: j,
                                y: i
                            };
                        }
                        floors.push({ x: j, y: i });
                        _this.arrayMap[i][j] = _this.indexMap.Room;
                        _this.allFloors.push({ x: j, y: i, type: _this.indexMap.Room });
                    }
                }
            }
            if (roomTopLeft != null) {
                _this.rooms.push(new Room_1.default(roomTopLeft, floors));
            }
        });
    };
    Main.prototype.constructArrayMap = function () {
        this.placeWalls();
        this.placePaths();
        this.placeRooms();
    };
    Main.prototype.getSeed = function () {
        return this.seed;
    };
    Main.prototype.getRooms = function () {
        return this.rooms;
    };
    Main.prototype.getPaths = function () {
        return this.paths;
    };
    Main.prototype.getAllFloors = function () {
        return this.allFloors;
    };
    Main.prototype.getMap = function () {
        return this.arrayMap;
    };
    return Main;
}());
exports.default = Main;

},{"../interfaces.namespace":11,"./InputErrorHandler":12,"./Node":14,"./Path":15,"./Room":17,"seedrandom":2}],14:[function(require,module,exports){
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var interfaces_namespace_1 = require("../interfaces.namespace");
var PathChunk_1 = __importDefault(require("./PathChunk"));
var RoomChunk_1 = __importDefault(require("./RoomChunk"));
var Node = /** @class */ (function () {
    function Node(chunk, RNG) {
        this.chunk = chunk;
        this.left = null;
        this.right = null;
        this.roomChunk = null;
        this.pathChunks = [];
        this.pathWidth = 1;
        this.Direction = interfaces_namespace_1.Interfaces.Direction.VERTICAL;
        this.isSplit = false;
        this.RNG = RNG;
    }
    Node.prototype.random = function (min, max) {
        return Math.floor(this.RNG() * (max - min)) + min;
    };
    Node.prototype.split = function (iterationCount) {
        this.isSplit = true;
        this.Direction = (this.RNG() > 0.5) ?
            interfaces_namespace_1.Interfaces.Direction.VERTICAL :
            interfaces_namespace_1.Interfaces.Direction.HORIZONTAL;
        var ratio = this.chunk.w / this.chunk.h;
        if (ratio <= this.chunk.minRatio) {
            this.Direction = interfaces_namespace_1.Interfaces.Direction.HORIZONTAL;
        }
        else if (ratio >= this.chunk.maxRatio) {
            this.Direction = interfaces_namespace_1.Interfaces.Direction.VERTICAL;
        }
        var shiftOffset = (this.Direction == interfaces_namespace_1.Interfaces.Direction.VERTICAL) ?
            this.random(-this.chunk.w / 4, this.chunk.w / 4) :
            this.random(-this.chunk.h / 4, this.chunk.h / 4);
        this.left = new Node({
            x: this.chunk.x,
            y: this.chunk.y,
            w: (this.Direction == interfaces_namespace_1.Interfaces.Direction.VERTICAL) ?
                this.chunk.w / 2 + shiftOffset :
                this.chunk.w,
            h: (this.Direction == interfaces_namespace_1.Interfaces.Direction.VERTICAL) ?
                this.chunk.h :
                this.chunk.h / 2 + shiftOffset,
            minRatio: this.chunk.minRatio,
            maxRatio: this.chunk.maxRatio,
            minWidth: this.chunk.minWidth,
            minHeight: this.chunk.minHeight
        }, this.RNG);
        this.right = new Node({
            x: (this.Direction == interfaces_namespace_1.Interfaces.Direction.VERTICAL) ?
                this.chunk.x + this.chunk.w / 2 + shiftOffset :
                this.chunk.x,
            y: (this.Direction == interfaces_namespace_1.Interfaces.Direction.VERTICAL) ?
                this.chunk.y :
                this.chunk.y + this.chunk.h / 2 + shiftOffset,
            w: (this.Direction == interfaces_namespace_1.Interfaces.Direction.VERTICAL) ?
                this.chunk.w / 2 - shiftOffset :
                this.chunk.w,
            h: (this.Direction == interfaces_namespace_1.Interfaces.Direction.VERTICAL) ?
                this.chunk.h :
                this.chunk.h / 2 - shiftOffset,
            minRatio: this.chunk.minRatio,
            maxRatio: this.chunk.maxRatio,
            minWidth: this.chunk.minWidth,
            minHeight: this.chunk.minHeight
        }, this.RNG);
        if (iterationCount > 0) {
            if (this.left.chunk.w > this.left.chunk.minWidth && this.left.chunk.h > this.left.chunk.minHeight) {
                this.left.split(iterationCount - 1);
            }
            if (this.right.chunk.w > this.right.chunk.minWidth && this.right.chunk.h > this.right.chunk.minHeight) {
                this.right.split(iterationCount - 1);
            }
        }
    };
    Node.prototype.generateRoomChunks = function () {
        if (!this.isSplit) {
            var x = Math.floor(this.chunk.x + this.random(this.chunk.w * 0.2, this.chunk.w * 0.25));
            var y = Math.floor(this.chunk.y + this.random(this.chunk.h * 0.2, this.chunk.h * 0.25));
            var w = Math.floor(this.random(this.chunk.w * 0.6, this.chunk.w * 0.7));
            var h = Math.floor(this.random(this.chunk.h * 0.6, this.chunk.h * 0.7));
            this.roomChunk = new RoomChunk_1.default(x, y, w, h);
        }
        if (this.left != null) {
            this.left.generateRoomChunks();
        }
        if (this.right != null) {
            this.right.generateRoomChunks();
        }
    };
    Node.prototype.constructPathChunks = function (a, b, direction, pathWidth) {
        var x1 = Math.floor(a.x);
        var y1 = Math.floor(a.y);
        var x2 = Math.floor(b.x);
        var y2 = Math.floor(b.y);
        var w = (direction == interfaces_namespace_1.Interfaces.Direction.VERTICAL) ? x2 - x1 : pathWidth;
        var h = (direction == interfaces_namespace_1.Interfaces.Direction.VERTICAL) ? pathWidth : y2 - y1;
        return new PathChunk_1.default(x1, y1, x2, y2, w, h);
    };
    Node.prototype.createPathChunks = function () {
        if (this.left != null && this.right != null) {
            this.pathChunks.push(this.constructPathChunks({
                x: this.left.chunk.x + this.left.chunk.w / 4,
                y: this.left.chunk.y + this.left.chunk.h / 4,
            }, {
                x: this.right.chunk.x + this.right.chunk.w / 1.5,
                y: this.right.chunk.y + this.right.chunk.h / 1.5,
            }, this.Direction, this.pathWidth));
            this.left.createPathChunks();
            this.right.createPathChunks();
        }
    };
    Node.prototype.getChunks = function () {
        var chunkArr = [this.chunk];
        if (this.left != null && this.right != null) {
            chunkArr = __spreadArrays(chunkArr, this.left.getChunks(), this.right.getChunks());
        }
        return chunkArr;
    };
    Node.prototype.getRoomChunks = function () {
        var roomArr = [];
        if (this.roomChunk != null) {
            roomArr.push(this.roomChunk);
        }
        if (this.left != null && this.right != null) {
            roomArr = __spreadArrays(roomArr, this.left.getRoomChunks(), this.right.getRoomChunks());
        }
        return roomArr;
    };
    Node.prototype.getPathChunks = function () {
        var pathArr = this.pathChunks;
        if (this.left != null && this.right != null) {
            pathArr = __spreadArrays(pathArr, this.left.getPathChunks(), this.right.getPathChunks());
        }
        return pathArr;
    };
    return Node;
}());
exports.default = Node;

},{"../interfaces.namespace":11,"./PathChunk":16,"./RoomChunk":18}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Path = /** @class */ (function () {
    function Path(args) {
        this.startPoint = args.startPoint;
        this.floors = args.floors;
        this.direction = args.direction;
        this.width = args.width;
    }
    return Path;
}());
exports.default = Path;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PathChunk = /** @class */ (function () {
    function PathChunk(x1, y1, x2, y2, w, h) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.w = w;
        this.h = h;
    }
    return PathChunk;
}());
exports.default = PathChunk;

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Room = /** @class */ (function () {
    function Room(topLeftCorner, floors) {
        this.topLeftCorner = topLeftCorner;
        this.floors = floors;
    }
    return Room;
}());
exports.default = Room;

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RoomChunk = /** @class */ (function () {
    function RoomChunk(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    return RoomChunk;
}());
exports.default = RoomChunk;

},{}]},{},[10])(10)
});
