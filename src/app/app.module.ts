import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { TypeaheadComponent } from "./typeahead/typeahead.component";

@NgModule({
    declarations: [AppComponent, TypeaheadComponent],
    bootstrap: [AppComponent],
    imports: [BrowserModule, AppRoutingModule],
    providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
