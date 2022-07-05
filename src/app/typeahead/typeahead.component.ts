import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { fromEvent } from "rxjs";
import { debounceTime, distinctUntilChanged, pluck, switchMap } from "rxjs/operators";

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
    rows: Entry[];

    constructor() {}

    ngAfterViewInit(): void {
        const input$ = fromEvent(this.inputBox.nativeElement, "input");
        input$
            .pipe(
                debounceTime(200),
                pluck("target", "value"),
                distinctUntilChanged(),
                switchMap(searchTerm => {
                    return this.getUrl("https://api.openbrewerydb.org/breweries?by_name=" + searchTerm);
                }),
            )
            .subscribe((response) => {
                this.rows = response;
            });
    }

    async getUrl(url: string): Promise<Entry[]> {
        const response = await fetch(url, {
            method: "GET",
        });
        if (response.status === 200) {
            return response.json();
        } else {
            return [
                {
                    name: "",
                },
            ];
        }
    }
}
