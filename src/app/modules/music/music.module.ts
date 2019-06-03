import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MusicComponent } from './music.component';

const routes: Routes = [
    {
        path: '',
        component: MusicComponent
    }
];

@NgModule({
    declarations: [MusicComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class MusicModule {
}
