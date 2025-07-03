import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick
} from "@angular/core/testing";
import { TypeaheadComponent } from "./typeahead.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { By } from "@angular/platform-browser";

describe("TypeaheadComponent", () => {
    let component: TypeaheadComponent;
    let fixture: ComponentFixture<TypeaheadComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, TypeaheadComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TypeaheadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should test input box", () => {
        sendInput("test");
        const input = fixture.debugElement.query(By.css("#textInput"));
        component.search();
        expect(input.nativeElement.value).toBe("test");
    });

    it("should test search", fakeAsync(() => {
        sendInput("test");
        const rows = component.search();
        const empty = [
            {
                name: "No response"
            }
        ];
        tick(200);
        expect(rows).toStrictEqual(empty);
    }));

    function sendInput(text: string) {
        const input = fixture.debugElement.query(By.css("#textInput"));
        input.nativeElement.value = text;
        input.nativeElement.dispatchEvent(new Event("input"));
        fixture.detectChanges();
        return fixture.whenStable();
    }
});
