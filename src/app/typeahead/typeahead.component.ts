import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { fromEvent, Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, pluck, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

interface Entry {
    name: string;
}

@Component({
    selector: "typeahead",
    templateUrl: "./typeahead.component.html",
    styleUrls: ["./typeahead.component.scss"],
})
export class TypeaheadComponent implements AfterViewInit {
    @ViewChild("textInput") inputBox!: ElementRef;
    rows: Observable<Entry[]>;

    constructor(private http: HttpClient) {}

    ngAfterViewInit(): void {
        this.search();
    }

    search(): Entry[] {
        const input$ = fromEvent(this.inputBox.nativeElement, "input");
        input$
            .pipe(
                debounceTime(200),
                pluck("target", "value"),
                distinctUntilChanged(),
                switchMap(searchTerm => {
                    this.rows = this.http.get<Entry[]>("https://api.openbrewerydb.org/breweries?by_name=" + searchTerm);
                    return this.rows;
                }),
            )
            .subscribe(); //returns Entry[]
        return [
            {
                name: "No response",
            },
        ];
    }
}
