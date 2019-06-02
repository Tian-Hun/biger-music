import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PlayerService } from '@core/player.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'biger-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    @ViewChild('canvas', {static: true}) canvasElementRef: ElementRef<HTMLCanvasElement>;

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
        private player: PlayerService
    ) {}

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
            .analyserChage
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

}
