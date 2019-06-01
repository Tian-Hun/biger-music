import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './components/header/header.component';
import { MiniPlayerComponent } from './components/mini-player/mini-player.component';
import { ProgressComponent } from './components/progress/progress.component';

@NgModule({
    declarations: [
        HeaderComponent,
        MiniPlayerComponent,
        ProgressComponent
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        HeaderComponent,
        MiniPlayerComponent,
        ProgressComponent
    ]
})
export class SharedModule {
}
