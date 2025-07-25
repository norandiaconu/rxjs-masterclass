import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
    animationFrameScheduler,
    asapScheduler,
    asyncScheduler,
    AsyncSubject,
    BehaviorSubject,
    fromEvent,
    interval,
    MonoTypeOperatorFunction,
    Observable,
    of,
    partition,
    queueScheduler,
    range,
    ReplaySubject,
    Subject,
    Subscription,
    throwError,
    timer,
} from "rxjs";
import {
    catchError,
    concatMap,
    delay,
    finalize,
    map,
    mergeMap,
    mergeMapTo,
    observeOn,
    pluck,
    retryWhen,
    share,
    shareReplay,
    subscribeOn,
    take,
    takeUntil,
    takeWhile,
    tap,
    throttleTime,
    withLatestFrom,
} from "rxjs/operators";
import { loadingBehaviorService, loadingService } from "./loading.service";
import { ObservableStoreComponent } from "./observable-store/observable-store.component";
import { NgStyle } from "@angular/common";
import { TypeaheadComponent } from "./typeahead/typeahead.component";
import { RouterOutlet } from "@angular/router";

export function customRetry({ excludedStatusCodes = [], retryAttempts = 3, scalingDuration = 1000 } = {}) {
    return function(source: { pipe: (arg0: MonoTypeOperatorFunction<unknown>) => any; }) {
        return source.pipe(
            retryWhen(attempts => {
                return attempts.pipe(
                    mergeMap((error, i) => {
                        const attemptNumber = i + 1;
                        if (attemptNumber > retryAttempts || excludedStatusCodes.find(e => e === error.status)) {
                            console.log("Giving up!");
                            return throwError(error);
                        }
                        console.log(`Attempt ${attemptNumber}: retrying in ${attemptNumber * scalingDuration}ms`);
                        return timer(attemptNumber * scalingDuration);
                    })
                );
            })
        );
    }
}

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    imports: [
        NgStyle,
        TypeaheadComponent,
        RouterOutlet
    ]
})
export class AppComponent implements OnInit, OnDestroy {
    private httpClient = inject(HttpClient);

    private readonly unsubscribe$ = new Subject();
    asapCounter = 0;
    asyncCounter = 0;
    position = -270;
    show = true;
    counter = "";
    counterFinalize = "";
    disableRadioButtons = true;

    observer = {
        next: (val: any) => console.log("next", val),
        error: (err: any) => console.log("error", err),
        complete: () => console.log("complete"),
    };

    ngOnInit(): void {
        this.loadingBehaviorSubject();
    }

    /* Subjects and multicasting */

    // old way of displaying the interval, can be run with interval() button
    interval(): Subscription {
        const subject = new Subject();
        const subscription = subject.subscribe(this.observer);
        subject.next("Hello");
        const subscriptionTwo = subject.subscribe(this.observer);
        subject.next("World");
        // next messages will be printed twice (subscription and subscriptionTwo) every two seconds
        // new interval will only be printed once every two seconds
        const interval$ = interval(2000).pipe(
            take(5),
            tap((value: number) => console.log("new interval", value)),
        );
        return interval$.subscribe(subject);
        // completes at the end because of the take within the pipe
    }

    // share observable for multiple subscriptions
    multicastInterval(): Subscription[] {
        const interval$ = interval(2000).pipe(
            take(5),
            tap((value: number) => console.log("new interval", value)),
        );
        const multicastedInterval$ = interval$.pipe(share());
        const subOne = multicastedInterval$.subscribe(this.observer);
        const subTwo = multicastedInterval$.subscribe(this.observer);
        return [subOne, subTwo];
        // completes at the end because of the take within the pipe
    }

    behaviorSubject(): Subscription[] {
        const subject = new BehaviorSubject("Hello");
        const subscription = subject.subscribe(this.observer);
        const subscriptionTwo = subject.subscribe(this.observer);
        subject.next("World");
        setTimeout(() => {
            subject.subscribe(this.observer);
            subject.complete();
        }, 3000);
        return [subscription, subscriptionTwo];
    }

    // old way of displaying the loading overlay, can be run with loading() button
    loading(): Subscription {
        const loadingOverlay = document.getElementById("loading-overlay");
        const loading$ = new Subject<boolean>();
        const sub = loading$.subscribe((isLoading) => {
            if (isLoading) {
                loadingOverlay?.classList.add("open");
            } else {
                loadingOverlay?.classList.remove("open");
            }
        });
        loading$.next(true);
        setTimeout(() => {
            loading$.next(false);
            loading$.complete();
        }, 3000);
        return sub;
    }

    // better method of displaying the loading overlay where show/hide methods are called instead
    loadingWithService(): Subscription {
        const loadingOverlay = document.getElementById("loading-overlay");
        const loadingSub = loadingService.loadingStatus$.subscribe((isLoading) => {
            if (isLoading) {
                loadingOverlay?.classList.add("open");
            } else {
                loadingOverlay?.classList.remove("open");
            }
        });
        loadingService.showLoading();
        setTimeout(() => {
            loadingService.hideLoading();
            loadingSub.unsubscribe();
        }, 1000);
        return loadingSub;
    }

    // do not need to call showLoading directly when using Behavior Subject
    loadingBehaviorSubject(): Subscription {
        const loadingOverlay = document.getElementById("loading-overlay");
        const loadingSub = loadingBehaviorService.loadingBehaviorStatus$.subscribe((isLoading) => {
            if (isLoading) {
                loadingOverlay?.classList.add("open");
            } else {
                loadingOverlay?.classList.remove("open");
            }
        });
        setTimeout(() => {
            loadingBehaviorService.hideLoading();
            loadingSub.unsubscribe();
        }, 1000);
        return loadingSub;
    }

    // setup the Observable Store and update the contained values
    useObservableStore(): ObservableStoreComponent {
        const store = new ObservableStoreComponent();
        store.setup({
            user: "Noran",
            isAuthenticated: false,
        });
        store.selectState("user").subscribe(console.log);
        store.updateState({
            user: "Diaconu",
        });
        store.updateState({
            isAuthenticated: true,
        });

        store.completeState();
        return store;
    }

    // replay the last "two" next calls when subscribing to the ReplaySubject
    useReplaySubject(): ReplaySubject<string> {
        const subject = new ReplaySubject<string>(2);
        subject.next("Hello");
        subject.next("World");
        subject.next("Goodbye");
        subject.subscribe(this.observer);

        subject.complete();
        return subject;
    }

    // shareReplay allows the get request to only occur once and the result is passed to each subscription
    useShareReplay(): Observable<Object> {
        const httpCall = this.httpClient.get("https://api.github.com/users/octocat");
        const request$ = httpCall.pipe(mergeMapTo(httpCall), shareReplay(1));
        request$.subscribe(this.observer);
        setTimeout(() => {
            console.log("subscribing");
            request$.subscribe(this.observer);
        }, 3000);
        return request$;
    }

    // displays output only upon complete instead of on subscribe
    useAsyncSubject(): AsyncSubject<string> {
        const subject = new AsyncSubject<string>();
        subject.subscribe(this.observer);
        subject.subscribe(this.observer);
        subject.next("Hello");
        subject.next("World");
        subject.next("Goodbye");
        subject.complete();
        return subject;
    }

    /* Schedulers */

    // used instead of setTimeout to postpone execution, but delay() is preferred as errors are thrown right away
    useAsyncScheduler(): Subscription[] {
        asyncScheduler.schedule(console.log, 3000, "Hello world");
        const sub1 = of(7, 8, 9)
            .pipe(
                tap((val) => console.log("tap789", val)),
                subscribeOn(asyncScheduler, 2000),
            )
            .subscribe(this.observer);
        const sub2 = of(4, 5, 6)
            .pipe(
                tap((val) => console.log("tap456", val)),
                observeOn(asyncScheduler, 1000),
            )
            .subscribe(this.observer);
        const sub3 = of(1, 2, 3).subscribe(this.observer);
        console.log("sync");
        return [sub1, sub2, sub3];
    }

    // compare display timing of asapScheduler compared to other methods
    useAsapScheduler(): Subscription {
        asyncScheduler.schedule(() => {
            console.log("asyncScheduler");
        });
        asapScheduler.schedule(() => {
            console.log("asapScheduler");
        });
        queueMicrotask(() => console.log("microtask"));
        Promise.resolve("promise").then(console.log);
        const sub = range(1, 5).subscribe(this.observer);
        console.log("sync");
        return sub;
    }

    // increments a counter using asyncScheduler
    useAsyncSchedulerCounter(): Subscription[] {
        const sub1 = range(1, 5, asapScheduler).subscribe(this.observer);
        const sub2 = range(1, 500, asyncScheduler)
            .pipe(tap((val) => (this.asyncCounter = val)))
            .subscribe();
        console.log("sync");
        return [sub1, sub2];
    }

    // increments a counter using asapScheduler
    useAsapSchedulerCounter(): Subscription[] {
        const sub1 = range(1, 5, asapScheduler).subscribe(this.observer);
        const sub2 = range(1, 1000000, asapScheduler)
            .pipe(tap((val) => (this.asapCounter = val)))
            .subscribe();
        console.log("sync");
        return [sub1, sub2];
    }

    // uses interval and animationFrameScheduler to translate circle
    useAnimationFrameScheduler(): Subscription {
        return interval(0, animationFrameScheduler)
            .pipe(
                takeWhile((val) => val <= 350),
                tap((val) => (this.position = val - 270)),
            )
            .subscribe();
    }

    // use multiple queueScheduler calls to show execution order
    useQueueScheduler(): Subscription {
        const sub = queueScheduler.schedule(() => {
            queueScheduler.schedule(() => {
                queueScheduler.schedule(() => console.log("inner queue"));
                console.log("middle queue");
            });
            console.log("outer queue");
        });
        console.log("sync");
        return sub;
    }

    toggleShow(): void {
        this.show = !this.show;
    }

    count(): void {
        this.counter = "";
        const sub = interval(1000).pipe(
            take(3)
        ).subscribe({
            next: val => {
                this.counter = val.toString();
            },
            complete: () => {
                this.counter = "Stopped!";
            }
        });
    }

    countFinalize(): void {
        this.counterFinalize = "";
        const sub = interval(1000).pipe(
            finalize(() => {
                this.counterFinalize = "Stopped!";
            })
        ).subscribe(val => {
            this.counterFinalize = val.toString();
        });
        setTimeout(() => {
            sub.unsubscribe();
        }, 3000);
    }

    retry(): Subscription {
        const click$ = fromEvent(document, "click");
        return click$.pipe(
            mergeMapTo(throwError({
                status: 400,
                message: "Server error"
            }).pipe(
                customRetry({
                    retryAttempts: 4
                }),
                catchError(err => of(err.message))
            ))
        ).subscribe(console.log);
    }

    combinationOperators(): void {
        this.disableRadioButtons = false;
        const saveAnswer = (answer: any, testId: unknown) => {
            return of({
                answer,
                testId
            }).pipe(delay(200));
        }
        const radioButtons = document.querySelectorAll('.radio-option');
        const answerChange$ = fromEvent(radioButtons, "click");
        const store$ = new BehaviorSubject({
            testId: "abc123",
            complete: false,
            moreData: {}
        });
        answerChange$.pipe(
            withLatestFrom(store$.pipe(
                pluck("testId")
            )),
            concatMap(([event, testId]) => {
                return saveAnswer((event.target as HTMLButtonElement).value, testId);
            })
        ).subscribe(console.log);
    }

    autoUnsubscribe(): Subject<unknown> {
        const onDestroy$ = new Subject();
        fromEvent<MouseEvent>(document, "click").pipe(
            map(event => ({
                x: event.clientX,
                y: event.clientY
            })),
            takeUntil(onDestroy$)
        ).subscribe(v => {
            console.log(v);
        });
        fromEvent(document, "scroll").pipe(
            throttleTime(30),
            takeUntil(onDestroy$)
        ).subscribe(v => {
            console.log(v);
        });
        interval(1000).pipe(
            takeUntil(onDestroy$)
        ).subscribe(v => {
            console.log(v);
        });
        setTimeout(() => {
            onDestroy$.next();
            onDestroy$.complete();
        }, 2000);
        return onDestroy$;
    }

    conditionalSubscribe(): Subscription[] {
        let leftPosition = 0;
        const box = document.getElementById("box");
        const click$ = fromEvent(document, "click");
        const xPositionClick$ = click$.pipe(
            map(event => {
                const e = event as MouseEvent;
                return {x: e.clientX, y: e.clientY};
            }),
        );
        const [leftSideClick$, rightSideClick$] = partition(xPositionClick$, position => {
            return position.x < window.innerWidth / 2;
        });
        const sub1 = leftSideClick$.subscribe(() => {
            if (box) {
                leftPosition -= 20;
                box.setAttribute("style", "left: " + leftPosition + "px");
            }
        });
        const sub2 = rightSideClick$.subscribe(() => {
            if (box) {
                leftPosition += 20;
                box.setAttribute("style", "left: " + leftPosition + "px");
            }
        });
        return [sub1, sub2];
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
