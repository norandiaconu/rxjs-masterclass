import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { TypeaheadComponent } from './typeahead.component';

describe('TypeaheadComponent', () => {
    let component: TypeaheadComponent;
    let fixture: ComponentFixture<TypeaheadComponent>;

    beforeEach(async () => {
        vi.useFakeTimers();
        await TestBed.configureTestingModule({
            imports: [TypeaheadComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TypeaheadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should test input box', () => {
        sendInput('test');
        const input = fixture.debugElement.query(By.css('#textInput'));
        component['search']();
        expect(input.nativeElement.value).toBe('test');
    });

    it('should test search', () => {
        sendInput('test');
        const rows = component['search']();
        const empty = [
            {
                name: 'No response'
            }
        ];
        vi.advanceTimersByTime(200);
        expect(rows).toStrictEqual(empty);
    });

    function sendInput(text: string) {
        const input = fixture.debugElement.query(By.css('#textInput'));
        input.nativeElement.value = text;
        input.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        return fixture.whenStable();
    }
});
