import { Component } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilKeyChanged, pluck, scan } from 'rxjs/operators';

interface UserState {
    user: string;
    isAuthenticated: boolean;
}

@Component({
    selector: 'observable-store',
    templateUrl: './observable-store.component.html',
    styleUrls: ['./observable-store.component.scss']
})
export class ObservableStoreComponent {
    private _store: BehaviorSubject<UserState>;
    private _stateUpdates: Subject<UserState>;

    public setup(initialState: UserState): void {
        this._store = new BehaviorSubject(initialState);
        this._stateUpdates = new Subject();
        this._stateUpdates
            .pipe(
                scan((acc: any, curr: any) => {
                    return { ...acc, ...curr };
                }, initialState)
            )
            .subscribe(this._store);
    }

    public updateState(stateUpdate: any): void {
        this._stateUpdates.next(stateUpdate);
    }

    public selectState(stateKey: any): Observable<UserState> {
        return this._store.pipe(distinctUntilKeyChanged(stateKey), pluck(stateKey));
    }

    public completeState(): void {
        this._store.complete();
        this._stateUpdates.next();
        this._stateUpdates.complete();
    }
}
