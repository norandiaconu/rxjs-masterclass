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
    })
})
