import { concat, from, interval, of } from "rxjs";
import { catchError, delay, map, take } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";

describe("Marble testing in RxJS", () => {
    let testScheduler: TestScheduler;

    beforeEach(() => {
        testScheduler = new TestScheduler((actual, expected) => {
            expect(actual).toEqual(expected);
        });
    });

    it("should convert ASCII diagrams into observables", () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable } = helpers;
            const source$ = cold("--a-b---c");
            const expected =     "--a-b---c";
            expectObservable(source$).toBe(expected);
        });
    });

    it("should allow configuration of emitted values", () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable } = helpers;
            const source$ = cold("--a-b---c", { a: 1, b: 2, c: 3});
            const final$ = source$.pipe(map(val => val * 10));
            const expected =     "--a-b---c";
            expectObservable(final$).toBe(expected, { a: 10, b: 20, c: 30});
        });
    });
    
    it("should let you identify subscription points", () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers;
            const source$ =            cold("-a---b-|");
            const source2$ =           cold("-c---d-|");
            const final$ = concat(source$, source2$);
            const expected =                "-a---b--c---d-|";
            const sourceOneExpectedSub =    "^------!";
            const sourceTwoExpectedSub =    "-------^------!";
            expectObservable(final$).toBe(expected);
            expectSubscriptions(source$.subscriptions).toBe(sourceOneExpectedSub);
            expectSubscriptions(source2$.subscriptions).toBe(sourceTwoExpectedSub);
        });
    });

    it("should let you test hot observables", () => {
        testScheduler.run(helpers => {
            const { hot, expectObservable } = helpers;
            const source$ = hot("--a-b-^-c");
            const final$ = source$.pipe(take(1));
            const expected =     "--(c|)";
            expectObservable(final$).toBe(expected);
        });
    });

    it("should let you test synchronous operations", () => {
        testScheduler.run(helpers => {
            const { expectObservable } = helpers;
            const source$ = from([1,2,3,4,5]);
            const expected = "(abcde|)";
            expectObservable(source$).toBe(expected, { a: 1, b: 2, c: 3, d: 4, e: 5});
        })
    });

    it("should let you test asynchronous operations", () => {
        testScheduler.run(helpers => {
            const { expectObservable } = helpers;
            const source$ = from([1,2,3,4,5]);
            const final$ = source$.pipe(delay(200));
            const expected = "200ms (abcde|)";
            expectObservable(final$).toBe(expected, { a: 1, b: 2, c: 3, d: 4, e: 5});
        })
    });

    it("should let you test errors and error messages", () => {
        let errorTestScheduler = new TestScheduler(() => {});
        errorTestScheduler.run(helpers => {
            const { expectObservable } = helpers;
            const source$ = of({ firstName: "Noran", lastName: "Diaconu" }, null).pipe(
                map(output => `${output?.firstName} ${output?.lastName}`),
                catchError(() => {
                    throw { message: "Invalid user!" };
                })
            );
            const expected = "(a#)";
            expectObservable(source$).toBe(expected, { a: "Noran Diaconu" }, { message: "Invalid user!" });
        });
    });

    it("should let you test snapshots of streams that do not complete", () => {
        testScheduler.run(helpers => {
            const { expectObservable } = helpers;
            const source$ = interval(1000).pipe(
                map(val => `${val + 1}sec`)
            );
            const expected = "1s a 999ms b 999ms c";
            const unsubscribe = "4s !";
            expectObservable(source$, unsubscribe).toBe(expected, {
                a: "1sec",
                b: "2sec",
                c: "3sec"
            });
        });
    });
});

describe("subscribe & assert testing in RxJs", () => {
    it("should compare each emitted value", () => {
        const source$ = of(1, 2, 3);
        const final$ = source$.pipe(
            map(val => val *10)
        );
        const expected = [10, 20, 30];
        let index = 0;
        final$.subscribe(val => {
            expect(val).toEqual(expected[index]);
            index++;
        });
    });
});
