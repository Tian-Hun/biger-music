import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from '@shared/components/header/header.component';
import { MiniPlayerComponent } from '@shared/components/mini-player/mini-player.component';
import { ProgressComponent } from '@shared/components/progress/progress.component';
import { VolumeSliderComponent } from '@shared/components/volume-slider/volume-slider.component';

@NgModule({
    declarations: [
        HeaderComponent,
        MiniPlayerComponent,
        ProgressComponent,
        VolumeSliderComponent,
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        HeaderComponent,
        MiniPlayerComponent,
        ProgressComponent,
        VolumeSliderComponent
    ]
})
export class SharedModule {
}
