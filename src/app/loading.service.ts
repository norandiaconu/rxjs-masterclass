import { BehaviorSubject, Subject } from "rxjs";

const loading$ = new Subject();
export const loadingService = {
    showLoading: () => loading$.next(true),
    hideLoading: () => loading$.next(false),
    loadingStatus$: loading$.asObservable()
}

const loadingBehavior$ = new BehaviorSubject(true);
export const loadingBehaviorService = {
    showLoading: () => loadingBehavior$.next(true),
    hideLoading: () => loadingBehavior$.next(false),
    loadingBehaviorStatus$: loadingBehavior$.asObservable()
}
