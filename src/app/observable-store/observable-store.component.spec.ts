import { ObservableStoreComponent } from './observable-store.component';

describe("ObservableStoreComponent", () => {

    it("should setup store", () => {
        const store = new ObservableStoreComponent();
        store.setup({
            user: "Noran",
            isAuthenticated: false,
        });
        expect(store).toBeTruthy();
    });

    it("should update store", () => {
        const store = new ObservableStoreComponent();
        store.setup({
            user: "Noran",
            isAuthenticated: false,
        });
        store.updateState({
            user: "Diaconu",
        });
        store.selectState("user").subscribe(user => expect(user).toBe("Diaconu"));
    });

    it("should complete state", () => {
        const store = new ObservableStoreComponent();
        store.setup({
            user: "Noran",
            isAuthenticated: false,
        });
        expect(store._store.isStopped).toBeFalsy();
        expect(store._stateUpdates.isStopped).toBeFalsy();
        expect(store._stateUpdates.observers).toBeTruthy();
        store.completeState();
        expect(store._store.isStopped).toBeTruthy();
        expect(store._stateUpdates.isStopped).toBeTruthy();
        expect(store._stateUpdates.observers).toStrictEqual([]);
        expect(store).toBeTruthy();
    });
});
