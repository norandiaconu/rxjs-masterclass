import { Component } from "@angular/core";
import { interval, Subject } from "rxjs";
import { take, tap } from "rxjs/operators";
import { loadingService } from "./loading.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent {
    title = "rxjs-masterclass";
    private readonly unsubscribe$ = new Subject();

    ngOnInit(): void {
        this.interval();
        this.loading2();
    }

    interval(): void {
        const observer = {
            next: (val: any) => console.log("next", val),
            error: (err: any) => console.log("error", err),
            complete: () => console.log("complete"),
        };

        const subject = new Subject();
        const subscription = subject.subscribe(observer);
        subject.next("Hello");
        const subscriptionTwo = subject.subscribe(observer);
        subject.next("World");
        // next messages will be printed twice (subscription and subscriptionTwo) every two seconds
        // new interval will only be printed once every two seconds
        const interval$ = interval(2000).pipe(
            take(5),
            tap((value: number) => console.log("new interval", value))
        );
        interval$.subscribe(subject);
    }

    // old way of displaying the loading overlay
    loading(): void {
        const loadingOverlay = document.getElementById("loading-overlay");
        const loading$ = new Subject();
        loading$.subscribe(isLoading => {
            if (isLoading) {
                loadingOverlay?.classList.add("open");
            } else {
                loadingOverlay?.classList.remove("open");
            }
        });
        loading$.next(true);
        setTimeout(() => loading$.next(false), 3000);
    }

    // better method of displaying the loading overlay where show/hide methods are called instead
    loading2(): void {
        const loadingOverlay = document.getElementById("loading-overlay");
        loadingService.loadingStatus$.subscribe(isLoading => {
            if (isLoading) {
                loadingOverlay?.classList.add("open");
            } else {
                loadingOverlay?.classList.remove("open");
            }
        });
        loadingService.showLoading();
        setTimeout(() => loadingService.hideLoading(), 1000);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
