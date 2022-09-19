import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { concat, from, interval, of, Subject } from "rxjs";
import { catchError, delay, map, mergeMap, take, toArray } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";
import { AppComponent } from "./app.component";
import { loadingBehaviorService } from "./loading.service";

describe("Marble testing in RxJS", () => {
    let fixture: ComponentFixture<AppComponent>;
    let app: AppComponent;
    jest.useFakeTimers();

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });

        fixture = TestBed.createComponent(AppComponent);
        app = fixture.componentInstance;
    });

    it("should setup app", () => {
        expect(app).toBeTruthy();
    });

    it("should interval", () => {
        const sub = app.interval();
        sub.unsubscribe();
        expect(sub.closed).toBeTruthy();
    });

    it("should observer error", () => {
        const subject = new Subject();
        const sub = subject.subscribe(app.observer);
        subject.error("Hello");
        sub.unsubscribe();
        expect(sub.closed).toBeTruthy();
    });

    it("should multicastInterval", () => {
        const subs = app.multicastInterval();
        subs.forEach(sub => {
            sub.unsubscribe();
            expect(sub.closed).toBeTruthy();
        });
    });

    it("should behaviorSubject", () => {
        const subs = app.behaviorSubject();
        jest.runAllTimers();
        subs.forEach(sub => {
            sub.unsubscribe();
            expect(sub.closed).toBeTruthy();
        });
    });

    it("should loading", () => {
        const sub = app.loading();
        jest.runAllTimers();
        sub.unsubscribe();
        expect(sub.closed).toBeTruthy();
    });

    it("should loadingWithService", () => {
        const sub = app.loadingWithService();
        jest.runAllTimers();
        sub.unsubscribe();
        expect(sub.closed).toBeTruthy();
    });

    it("should ngOnInit/loadingBehaviorSubject", () => {
        app.ngOnInit();
        const sub = app.loadingBehaviorSubject();
        jest.runAllTimers();
        sub.unsubscribe();
        expect(sub.closed).toBeTruthy();
    });

    it("should ngOnInit/loadingBehaviorSubject and showLoading", () => {
        app.ngOnInit();
        const sub = app.loadingBehaviorSubject();
        jest.runAllTimers();
        loadingBehaviorService.showLoading();
        sub.unsubscribe();
        expect(sub.closed).toBeTruthy();
    });

    it("should useObservableStore", () => {
        const store = app.useObservableStore();
        expect(store._store.value).toStrictEqual({"isAuthenticated": true, "user": "Diaconu"});
    });
    
    it("should useReplaySubject", () => {
        const sub = app.useReplaySubject();
        sub.unsubscribe();
        expect(sub.closed).toBeTruthy();
    });
    
    it("should useShareReplay", () => {
        const sub = app.useShareReplay();
        jest.runAllTimers();
        expect(sub).toBeTruthy();
    });

    it("should useAsyncSubject", () => {
        const sub = app.useAsyncSubject();
        sub.unsubscribe();
        expect(sub.closed).toBeTruthy();
    });

    it("should useAsyncScheduler", () => {
        const subs = app.useAsyncScheduler();
        subs.forEach(sub => {
            sub.unsubscribe();
            expect(sub.closed).toBeTruthy();
        });
    });

    it("should useAsapScheduler", () => {
        const sub = app.useAsapScheduler();
        sub.unsubscribe();
        expect(sub.closed).toBeTruthy();
    });

    it("should useAsyncSchedulerCounter", () => {
        const subs = app.useAsyncSchedulerCounter();
        subs.forEach(sub => {
            sub.unsubscribe();
            expect(sub.closed).toBeTruthy();
        });
    });

    it("should useAsapSchedulerCounter", () => {
        const subs = app.useAsapSchedulerCounter();
        subs.forEach(sub => {
            sub.unsubscribe();
            expect(sub.closed).toBeTruthy();
        });
    });

    it("should useAnimationFrameScheduler", () => {
        const sub = app.useAnimationFrameScheduler();
        sub.unsubscribe();
        expect(sub.closed).toBeTruthy();
    });

    it("should useQueueScheduler", () => {
        const sub = app.useQueueScheduler();
        sub.unsubscribe();
        expect(sub.closed).toBeTruthy();
    });

    it("should toggleShow", () => {
        app.show = false;
        app.toggleShow();
        expect(app.show).toBeTruthy();
    });

    it("should count", () => {
        app.count();
        jest.runAllTimers();
        expect(app.counter).toBe("Stopped!");
    });

    it("should countFinalize", () => {
        app.countFinalize();
        jest.runAllTimers();
        expect(app.counterFinalize).toBe("Stopped!");
    });
});

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

    it("should let you test errors and error messages with subscribe", () => {
        const source$ = of({ firstName: "Noran", lastName: "Diaconu" }, null).pipe(
            map(output => `${output?.firstName} ${output?.lastName}`),
            catchError(() => {
                throw { message: "Invalid user!" };
            })
        );
        const expected = ["Noran Diaconu", "Invalid user!"];
        let actual: string[] = [];
        source$.subscribe({
            next: value => {
                actual.push(value);
            },
            error: error => {
                actual.push(error);
                expect(actual).toEqual(expected);
            }
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

    it("should compare emitted values on completion with toArray", () => {
        const source$ = of(1, 2, 3);
        const final$ = source$.pipe(
            map(val => val *10),
            toArray()
        );
        const expected = [10, 20, 30];
        final$.subscribe(val => {
            expect(val).toEqual(expected);
        });
    });

    it("should let you test async operations with done callback", done => {
        const source$ = of("Ready", "Set", "Go!").pipe(
            mergeMap((message) => of(message))
        );
        const expected = ["Ready", "Set", "Go!"];
        let index = 0;
        source$.subscribe(val => {
            expect(val).toEqual(expected[index]);
            index++;
        }, null, done);
    });
});
