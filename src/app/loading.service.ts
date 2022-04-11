import { Subject } from "rxjs";

const loading$ = new Subject();
export const loadingService = {
    showLoading: () => loading$.next(true),
    hideLoading: () => loading$.next(false),
    loadingStatus$: loading$.asObservable()
}
