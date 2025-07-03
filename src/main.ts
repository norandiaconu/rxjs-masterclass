import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import {
    provideHttpClient,
    withInterceptorsFromDi
} from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule),
        provideHttpClient(withInterceptorsFromDi())
    ]
}).catch((err) => console.error(err));
