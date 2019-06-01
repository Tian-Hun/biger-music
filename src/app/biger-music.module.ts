import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgForageModule, NgForageConfig, Driver } from 'ngforage';
import 'hammerjs';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { BigerMusicRoutingModule } from './biger-music-routing.module';
import { BigerMusicComponent } from './biger-music.component';

@NgModule({
    declarations: [
        BigerMusicComponent
    ],
    imports: [
        BrowserModule,
        NgForageModule.forRoot(),
        CoreModule,
        SharedModule,
        BigerMusicRoutingModule,
    ],
    providers: [],
    bootstrap: [BigerMusicComponent]
})
export class BigerMusicModule {
    constructor(ngfConfig: NgForageConfig) {
        ngfConfig.configure({
            name: 'BigerMusic',
            driver: [ // defaults to indexedDB -> webSQL -> localStorage
                Driver.INDEXED_DB,
                Driver.LOCAL_STORAGE
            ]
        });
    }
}
