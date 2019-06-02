import { Component, EventEmitter, Input, Output, ElementRef, ViewChild } from '@angular/core';
import { TweenMax, Power2 } from 'gsap';

@Component({
    selector: 'biger-volume-slider',
    templateUrl: './volume-slider.component.html',
    styleUrls: ['./volume-slider.component.scss']
})
export class VolumeSliderComponent {

    @ViewChild('volumeButton', {static: true}) volumeButton: ElementRef<HTMLButtonElement>;
    @ViewChild('slider', {static: true}) slider: ElementRef<HTMLDivElement>;

    @Input() value: number;

    @Output() readonly rangeChange: EventEmitter<number>;


    constructor() {
        this.value = 0;
        this.rangeChange = new EventEmitter<number>();
    }

    onInput(value: number): void {
        this.rangeChange.next(Number((value / 100).toFixed(1)));
    }

    onVolumeButtonClick(): void {
        TweenMax.fromTo(this.slider.nativeElement, 0.2,
            {x: -20, opacity: 0, scale: 0.3, display: 'none'},
            {x: 0, opacity: 1, display: 'flex', scale: 1, ease: Power2.easeInOut}
        );
    }

    onSliderMouseleave(): void {
        TweenMax.to(this.slider.nativeElement, 0.2, {opacity: 0, display: 'none', ease: Power2.easeInOut});
    }

}
