import { Component } from "@angular/core";
import { interval, Subject } from "rxjs";
import { tap } from "rxjs/operators";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent {
    title = "rxjs-masterclass";

    ngOnInit(): void {
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
        const interval$ = interval(2000).pipe(tap((value: number) => console.log("new interval", value)));
        interval$.subscribe(subject);
    }
}
