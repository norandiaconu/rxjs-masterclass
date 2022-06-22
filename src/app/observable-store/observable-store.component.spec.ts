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
});
