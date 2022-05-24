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
});
