import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { PlayerService } from '@core/player.service';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { AutoUnsubscribe } from '@shared/decorators/auto-unsubscribe.decorator';

@AutoUnsubscribe()
@Component({
    selector: 'biger-home',
    templateUrl: './music.component.html',
    styleUrls: ['./music.component.scss']
})
export class MusicComponent implements OnInit, OnDestroy {

    @ViewChild('canvas', {static: true}) canvasElementRef: ElementRef<HTMLCanvasElement>;

    lyrics: Array<any>;
    currentIndex: number;
    analyser: any;
    bufferLength: any;
    dataArray: Uint8Array;
    canvasElement: HTMLCanvasElement;

    frequencyBarGraphs: {
        fullWidth: number;
        fullHeight: number;
        barWidth: number;
        barHeight: number;
        x: number;
        ctx: any;
    };

    constructor(
        private player: PlayerService,
    ) {
    }

    initialize(analyser): void {
        this.analyser = analyser;
        this.analyser.fftSize = 256;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.frequencyBarGraphs.barWidth = (this.canvasElement.width / this.bufferLength) * 2.5;
        this.dataArray = new Uint8Array(this.bufferLength);
    }

    ngOnInit(): void {
        this.canvasElement = this.canvasElementRef.nativeElement;
        this.canvasElement.width = window.innerWidth;
        this.canvasElement.height = window.innerHeight;

        this.player
            .analyserChange
            .pipe(filter(analyser => !!analyser))
            .subscribe(analyser => {
                this.initialize(analyser);
                this.drawFrequencyBarGraphs();
            });

        this.frequencyBarGraphs = {
            fullWidth: this.canvasElement.width,
            fullHeight: this.canvasElement.height,
            barWidth: 0,
            barHeight: 0,
            x: 0,
            ctx: this.canvasElement.getContext('2d')
        };

        this.player
            .songChange
            .pipe(
                distinctUntilChanged(),
                filter(song => !!song)
            )
            .subscribe(song => {
                this.generateLyric(song.lyric);
            });

        this.player
            .progressTime
            .pipe(filter(value => !!value.original))
            .subscribe(({ original }) => {
                let currentIndex = 0;
                for (let i = 0; i < this.lyrics.length; i++) {
                    if (original > this.lyrics[i][0] - 1) {
                        currentIndex = i;
                    }
                }
                this.currentIndex = currentIndex;
            });
    }

    drawFrequencyBarGraphs(): void {

        this.frequencyBarGraphs.x = 0;

        this.analyser.getByteFrequencyData(this.dataArray);
        this.frequencyBarGraphs.ctx.clearRect(0, 0, this.frequencyBarGraphs.fullWidth, this.frequencyBarGraphs.fullHeight);

        for (let i = 0; i < this.bufferLength; i++) {
            this.frequencyBarGraphs.barHeight = this.dataArray[i];

            const r = this.frequencyBarGraphs.barHeight + ((i / this.bufferLength) * 150);
            const g = (i / this.bufferLength) * 20;
            const b = 10;

            this.frequencyBarGraphs.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.frequencyBarGraphs.ctx.fillRect(
                this.frequencyBarGraphs.x,
                this.frequencyBarGraphs.fullHeight - this.frequencyBarGraphs.barHeight,
                this.frequencyBarGraphs.barWidth,
                this.frequencyBarGraphs.barHeight
            );
            this.frequencyBarGraphs.x += this.frequencyBarGraphs.barWidth + 1;

        }

        requestAnimationFrame(this.drawFrequencyBarGraphs.bind(this));

    }

    generateLyric(lyric: string = ''): void {
        const originalLyric = decodeURIComponent(escape(window.atob(lyric || '')));
        this.lyrics = parseLyric(originalLyric);
    }

    ngOnDestroy(): void {}


}

export function parseLyric(lyric: string): any {
    let lines = lyric.split('\n');
    const pattern = /\[\d{2}:\d{2}.\d{2}\]/g;
    const result = [];
    while (!pattern.test(lines[0])) {
        lines = lines.slice(1);
    }
    lines[lines.length - 1].length === 0 && lines.pop();
    for (const data of lines) {
        const index = data.indexOf(']');
        const time = data.substring(0, index + 1);
        const value = data.substring(index + 1);
        const timeString = time.substring(1, time.length - 2);
        const timeArr = timeString.split(':');
        result.push([parseInt(timeArr[0], 10) * 60 + parseFloat(timeArr[1]), value]);
    }
    result.sort((a, b) => a[0] - b[0]);

    return result;
}
