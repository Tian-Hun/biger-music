import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'music',
        pathMatch: 'full'
    },
    {
        path: 'music',
        loadChildren: () => import('./modules/music/music.module').then(m => m.MusicModule)
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class BigerMusicRoutingModule {
}
