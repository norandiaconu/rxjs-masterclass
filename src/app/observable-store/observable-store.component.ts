import { Component } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { distinctUntilKeyChanged, pluck, scan } from "rxjs/operators";

interface UserState {
    user: string,
    isAuthenticated: boolean,
};

@Component({
    selector: "observable-store",
    templateUrl: "./observable-store.component.html",
    styleUrls: ["./observable-store.component.scss"],
})
export class ObservableStoreComponent {
    _store: BehaviorSubject<UserState>;
    _stateUpdates: Subject<UserState>;

    constructor() {}

    setup(initialState: UserState): void {
        this._store = new BehaviorSubject(initialState);
        this._stateUpdates = new Subject();
        this._stateUpdates.pipe(
            scan((acc: any, curr: any) => {
                return {...acc, ...curr};
            }, initialState)
        ).subscribe(this._store);
    }

    updateState(stateUpdate: any): void {
        this._stateUpdates.next(stateUpdate);
    }

    selectState(stateKey: any): Observable<UserState> {
        return this._store.pipe(
            distinctUntilKeyChanged(stateKey),
            pluck(stateKey)
        );
    }

    completeState(): void {
        this._store.complete();
        this._stateUpdates.next();
        this._stateUpdates.complete();
    }
}
