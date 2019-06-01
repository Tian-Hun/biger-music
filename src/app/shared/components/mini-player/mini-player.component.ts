import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Power2, TweenMax } from 'gsap';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

import { PlayerService } from '@core/player.service';
import { AutoUnsubscribe } from '@shared/decorators/auto-unsubscribe.decorator';
import { Progress, Song } from '@shared/types';
import { Direction, LoopMode } from '@shared/enums';

@AutoUnsubscribe()
@Component({
    selector: 'biger-mini-player',
    templateUrl: './mini-player.component.html',
    styleUrls: ['./mini-player.component.scss']
})
export class MiniPlayerComponent implements OnInit, OnDestroy {

    @ViewChild('playButton', {static: true}) playButton: ElementRef<HTMLButtonElement>;
    @ViewChild('pauseButton', {static: true}) pauseButton: ElementRef<HTMLButtonElement>;
    @ViewChild('list', {static: true}) loopList: ElementRef<SVGElement>;
    @ViewChild('single', {static: true}) loopSingle: ElementRef<SVGElement>;
    @ViewChild('random', {static: true}) loopRandom: ElementRef<SVGElement>;

    song: Song;
    progress: Progress;
    loopMode: LoopMode;
    progressSubject = new Subject<number>();

    constructor(
        private player: PlayerService
    ) {
        this.loopMode = LoopMode.list;
    }

    ngOnInit(): void {
        this.progress = this.player.progress;

        this.player
            .songChange
            .pipe(
                distinctUntilChanged(),
                filter(song => !!song)
            )
            .subscribe(song => this.song = song);

        this.progressSubject
            .pipe(debounceTime(500))
            .subscribe(value => this.player.seek(value / 100));
    }

    onPlayClick(): void {
        buildAnimationForElement(this.playButton.nativeElement, this.pauseButton.nativeElement);

        this.player.play();
    }

    onPauseClick(): void {
        buildAnimationForElement(this.pauseButton.nativeElement, this.playButton.nativeElement);

        this.player.pause();
    }

    onPrevClick(): void {
        this.player.skip(Direction.prev);
    }

    onNextClick(): void {
        this.player.skip(Direction.next);
    }

    onLoopClick(): void {
        const modes = [
            LoopMode.single,
            LoopMode.random,
            LoopMode.list
        ];

        const loopSvg = [
            [this.loopList.nativeElement, this.loopSingle.nativeElement],
            [this.loopSingle.nativeElement, this.loopRandom.nativeElement],
            [this.loopRandom.nativeElement, this.loopList.nativeElement]
        ];

        const [original, target] = loopSvg[this.loopMode];

        buildAnimationForElement(original, target);

        this.loopMode = modes[this.loopMode];

        this.player.loop(this.loopMode);

    }

    ngOnDestroy(): void {
    }

}

export function buildAnimationForElement(original: Element, target: Element): void {
    TweenMax.to(original, 0.2, {x: 20, opacity: 0, display: 'none', scale: 0.3, ease: Power2.easeInOut});
    TweenMax.fromTo(target, 0.2,
        {x: -20, opacity: 0, scale: 0.3, display: 'none'},
        {x: 0, opacity: 1, display: 'block', scale: 1, ease: Power2.easeInOut}
    );
}
