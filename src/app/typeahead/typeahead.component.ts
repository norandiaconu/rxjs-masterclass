import { AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, pluck, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';

interface Entry {
    name: string;
}

@Component({
    selector: 'typeahead',
    templateUrl: './typeahead.component.html',
    styleUrls: ['./typeahead.component.scss'],
    imports: [AsyncPipe]
})
export class TypeaheadComponent implements AfterViewInit {
    protected rows: Observable<Entry[]>;

    private readonly http = inject(HttpClient);
    private readonly inputBox = viewChild.required<ElementRef>('textInput');

    ngAfterViewInit(): void {
        this.search();
    }

    private search(): Entry[] {
        const input$ = fromEvent(this.inputBox().nativeElement, 'input');
        input$
            .pipe(
                debounceTime(200),
                pluck('target', 'value'),
                distinctUntilChanged(),
                switchMap((searchTerm) => {
                    this.rows = this.http.get<Entry[]>('https://api.openbrewerydb.org/v1/breweries?by_name=' + searchTerm);
                    return this.rows;
                })
            )
            .subscribe(); //returns Entry[]
        return [
            {
                name: 'No response'
            }
        ];
    }
}
