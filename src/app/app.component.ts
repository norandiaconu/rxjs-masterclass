import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
    animationFrameScheduler,
    asapScheduler,
    asyncScheduler,
    AsyncSubject,
    BehaviorSubject,
    interval,
    Observable,
    of,
    queueScheduler,
    range,
    ReplaySubject,
    Subject,
    Subscription,
} from "rxjs";
import { mergeMapTo, observeOn, share, shareReplay, subscribeOn, take, takeWhile, tap } from "rxjs/operators";
import { loadingBehaviorService, loadingService } from "./loading.service";
import { ObservableStoreComponent } from "./observable-store/observable-store.component";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent {
    title = "rxjs-masterclass";
    private readonly unsubscribe$ = new Subject();
    asapCounter = 0;
    asyncCounter = 0;
    position = -270;
    show = true;

    observer = {
        next: (val: any) => console.log("next", val),
        error: (err: any) => console.log("error", err),
        complete: () => console.log("complete"),
    };

    constructor(private httpClient: HttpClient) {}

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

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
