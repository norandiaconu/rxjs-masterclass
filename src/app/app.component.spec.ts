import { map } from "rxjs/operators";
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
    })
})
