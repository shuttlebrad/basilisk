/// <reference path="../../d.ts/DefinitelyTyped/jasmine/jasmine.d.ts"/>

import basilisk = require('../basilisk');

import V = basilisk.Vector;

var freeze = (obj:any):any => { return (Object.freeze) ? Object.freeze(obj) : obj; };

function charArray(prefix, count):string[] {
    var r = [];
    for (var i=0; i<count; i++) {
        r.push(prefix+i);
    }
    return r;
}

describe("PersistentVector", function () {
    describe('.from', function () {
        it("Should return an empty vector when called with an empty array.", function () {
            var result = V.from([]);

            expect(result.length).toBe(0);
        });

        it("Should contain the elements from the initial array when short.", function () {
            var result = V.from(charArray('a', 3));

            expect(result.length).toBe(3);
        });
    });

    describe('.get', function () {
        it("Should retrieve values in the 0th level.", function () {
            var example = new V(freeze(charArray('a', 3)), 0, 3);

            expect(example.get(0)).toBe('a0');
            expect(example.get(1)).toBe('a1');
            expect(example.get(2)).toBe('a2');
        });

        it("Should give an out of bounds error if the index equals or exceeds the length", function () {
            var example = new V(freeze(charArray('a', 3)), 0, 3);

            expect(() => { example.get(3); }).toThrow("OutOfBounds");
            expect(() => { example.get(4); }).toThrow("OutOfBounds");
        });


        it("Should give an out of bounds error if the index is too negative", function () {
            var example = new V(freeze(charArray('a', 3)), 0, 3);

            expect(() => { example.get(-4); }).toThrow("OutOfBounds");
        });

        it("Should retrieve the correct values for larger vectors.", function () {
            var example = new V(freeze([
                freeze(charArray('a', 32)),
                freeze(charArray('b', 5))
            ]), 5, 37);

            expect(example.get(32)).toBe('b0');
            expect(example.get(31)).toBe('a31');
            expect(example.get(36)).toBe('b4');
        });
    });

    describe('.set', function () {
        it("Should be possible to replace a particular entry in the vector.", function () {
            var example = new V(freeze([
                freeze(charArray('a', 32)),
                freeze(charArray('b', 5))
            ]), 5, 37),
                mod1 = example.set(3, 'changed'),
                mod2 = example.set(33, 'changed');

            expect(example.get(3)).toBe('a3');
            expect(example.get(33)).toBe('b1');

            expect(mod1.get(3)).toBe('changed');
            expect(mod1.get(33)).toBe('b1');

            expect(mod2.get(3)).toBe('a3');
            expect(mod2.get(33)).toBe('changed');
        });
    });

    describe('.push', function () {
        it("Should be possible to add a number to an empty vector.", function () {
            var eg = V.from<number>([]),
                eg1 = eg.push(5);

            expect(eg.length).toBe(0);
            expect(eg1.length).toBe(1);
            expect(eg1.get(0)).toBe(5);
        });

        it("Should be possible to add a number to a vector that is almost full.", function () {
            var eg = V.from<string>(charArray('a', 32)),
                eg1 = eg.push('b0');

            expect(eg.length).toBe(32);
            expect(eg1.length).toBe(33);
            expect(eg1.get(32)).toBe('b0');
        });
    });

    describe('.peek', function () {

    });

    describe('.pop', function () {
        it("Should throw an error if the vector is empty.", function () {
            var v = V.from<number>([]);

            expect( () => { v.pop(); }).toThrow("OutOfBounds");
        });

        it("Should return an empty vector if there is a single element in the vector.", function () {
            var v = V.from<number>([5]),
                v1 = v.pop();

            expect(v.length).toBe(1);
            expect(v.get(0)).toBe(5);

            expect(v1.length).toBe(0);
        });

        // the first boundary is at 32.
        it("Should drop from 35 to 30 items cleanly", function () {
            var v = V.from<string>(charArray('a', 35)),
                l = v.length,
                steps = 0;

            expect(v.length).toBe(35);
            expect(v.get(v.length - 1)).toBe('a' + (v.length - 1));

            while (l > 29) {
                steps += 1;
                if (steps > 6) {
                    throw "Should not have taken more than 6 iterations to drop the count.";
                }
                v = v.pop();

                expect(v.length).toBe(l - 1);
                l = v.length;
            }
        });


        // the step from depth 2 to depth 3 occurs at 32 * 32
        it("Should drop from 3 levels to 2 levels cleanly", function () {
            var v = V.from<string>(charArray('a', 32 * 32 + 10)),
                l = v.length,
                steps = 0;

            expect(v.length).toBe(32 * 32 + 10);
            expect(v.get(v.length - 1)).toBe('a' + (v.length - 1));

            while (l > 32 * 32 - 10) {
                steps += 1;
                if (steps > 30) {
                    throw "Should not have taken more than 20 iterations to drop the count.";
                }
                v = v.pop();

                expect(v.length).toBe(l - 1);
                expect(v.get(v.length - 1)).toBe('a' + (v.length - 1));
                l = v.length;
            }
        });
    });

    describe('.forEach', function () {
        it("Should be called for each item in turn.", function () {
            var seen = {},
                indexMap = {
                    'a': 0,
                    'b': 1,
                    'c': 2
                },
                called = 0,

                example = V.from(['a','b','c']);

            example.forEach( (item:string, index:number) => {
                called += 1;
                expect(index).toBe(indexMap[item]);
            });

            expect(called).toBe(3);
        });
    });

    describe('.equals', function () {
        it("Should compare simple vectors equally.", function () {
            var empty1 = V.from([]), empty2 = V.from([]),
                small1 = V.from(charArray('a', 33)), small2 = V.from(charArray('a', 33));

            expect(empty1.equals(empty2)).toBe(true);
            expect(small1.equals(small2)).toBe(true);
            expect(empty1.equals(small1)).not.toBe(true);
        });

        it("Should compare long vectors correctly.", function () {
            var big1 = V.from(charArray('a', 32 * 32 + 10)),
                big2 = V.from(charArray('a', 32 * 32 + 10));

            expect(big1.equals(big2)).toBe(true);

            // change an element.

            big2 = big2.set(335, 'changed');
            expect(big2.equals(big1)).toBe(false);
        });
    });
});