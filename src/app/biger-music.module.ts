import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DEFAULT_CONFIG, Driver, NgForageOptions } from 'ngforage';
import 'hammerjs';

import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { BigerMusicRoutingModule } from './biger-music-routing.module';
import { BigerMusicComponent } from './biger-music.component';

const ngForageOptions: NgForageOptions = {
    name: 'BigerMusic',
    driver: [ // defaults to indexedDB -> webSQL -> localStorage
        Driver.INDEXED_DB,
        Driver.LOCAL_STORAGE
    ]
};

@NgModule({
    declarations: [
        BigerMusicComponent
    ],
    imports: [
        BrowserModule,
        CoreModule,
        SharedModule,
        BigerMusicRoutingModule,
    ],
    providers: [
        {
            provide: DEFAULT_CONFIG,
            useValue: ngForageOptions
        }
    ],
    bootstrap: [BigerMusicComponent]
})
export class BigerMusicModule {
}
