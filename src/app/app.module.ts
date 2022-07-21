import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { TypeaheadComponent } from './typeahead/typeahead.component';

@NgModule({
    declarations: [AppComponent, TypeaheadComponent],
    imports: [BrowserModule, AppRoutingModule, HttpClientModule],
    providers: [HttpClient, HttpClientModule],
    bootstrap: [AppComponent],
})
export class AppModule {}
