import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { Utilities } from './utilities';

@Component({
    selector: 'biger-progress',
    templateUrl: './progress.component.html',
    styleUrls: ['./progress.component.scss']
})
export class ProgressComponent extends Utilities implements OnInit, OnChanges {

    private sliderModel = [0, 0, 0];
    private sliderWidth = 0;
    private totalDiff = 100;
    private startClientX = 0;
    private startPosition = 0;
    private minValue: number;
    private maxValue: number;
    private minSelected: number;
    private maxSelected: number;
    private sliderInitiated = false;

    public handlerX = 0;
    public isHandlerActive = false;
    public isTouchEventStart = false;
    public isMouseEventStart = false;
    public currentHandlerIndex = 0;

    private initValue = 0;
    private currentValue = 0;

    constructor() {
        super();
    }

    @Input('min')
    set setMinValue(value: number) {
        if (!isNaN(value)) {
            this.minValue = Number(value);
        }
    }

    @Input('max')
    set setMaxValue(value: number) {
        if (!isNaN(value)) {
            this.maxValue = Number(value);
        }
    }

    @Input('value')
    set setCurrentValue(value: number) {
        if (!isNaN(value) && this.currentValue !== Number(value)) {
            this.currentValue = Number(value);
        }
    }

    @Output()
    readonly change = new EventEmitter<number>();

    @ViewChild('bar', {static: true}) bar: ElementRef<HTMLDivElement>;

    ngOnInit(): void {
        this.initializeSlider();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.sliderInitiated) {
            this.resetModel();
        }
    }

    /*Method to initailize entire Slider*/
    public initializeSlider(): void {
        try {
            // Taking width of slider bar element.
            this.sliderWidth = this.bar.nativeElement.offsetWidth;
            this.sliderInitiated = true;
        } catch (e) {
            console.error(e);
        }
    }

    /*Method to initialize variables and model values */
    private resetModel(): void {
        this.validateSliderValues();
        // Setting the model values
        this.sliderModel = [
            this.currentValue - this.initValue,
            100 - this.currentValue,
            0
        ];
        requestAnimationFrame(this.setHandlerPosition.bind(this, true));
    }

    /*Method to do validation of init and seleted range values*/
    private validateSliderValues(): void {
        if (this.isNullOrEmpty(this.minValue) || this.isNullOrEmpty(this.maxValue)) {
            this.updateCurrentValue(0);
        } else if (this.minValue > this.maxValue) {
            this.updateCurrentValue(0);
        } else {
            this.initValue = this.minValue;
            /*
            * Validation for Selected range values
            */
            if (this.isNullOrEmpty(this.minSelected) || this.minSelected < this.minValue || this.minSelected > this.maxValue) {
                this.minSelected = this.minValue;
            }
            if (this.isNullOrEmpty(this.maxSelected) || this.maxSelected < this.minValue || this.maxSelected > this.maxValue) {
                this.maxSelected = this.maxValue;
            }
            if (this.minSelected > this.maxSelected) {
                this.minSelected = this.minValue;
                this.maxSelected = this.maxValue;
            }
        }
    }

    /*Method to set current selected values */
    private updateCurrentValue(value: number): void {
        this.minSelected = this.currentValue = value;
        this.change.emit(this.currentValue);
    }

    /*Method to set handler position */
    private setHandlerPosition(privateChange: boolean = false): void {
        // Updating selected values : current values
        if (!privateChange) {
            this.updateCurrentValue(this.initValue + this.currentValue);
        }
        /*Setting handler position */
        this.handlerX = this.currentValue;
    }

    /*Method to set model array values - will try to refine the values using step */
    private setModelValue(value: number): void {
        this.sliderModel[0] = value;
        this.currentValue = value;
    }

    /*Method to disable handler movement*/

    /*Execute on events:
    * on-mouseup
    * on-panend
    */
    @HostListener('document:mouseup')
    @HostListener('document:panend')
    setHandlerActiveOff(): void {
        this.isMouseEventStart = false;
        this.isTouchEventStart = false;
        this.isHandlerActive = false;
    }

    /*Method to detect start draging handler*/

    /*Execute on events:
    * on-mousedown
    * on-panstart
    */
    public setHandlerActive(event: any): void {
        event.preventDefault();
        if (!this.isNullOrEmpty(event.clientX)) {
            this.startClientX = event.clientX;
            this.isMouseEventStart = true;
            this.isTouchEventStart = false;
        } else if (!this.isNullOrEmpty(event.deltaX)) {
            this.startClientX = event.deltaX;
            this.isTouchEventStart = true;
            this.isMouseEventStart = false;
        }
        if (this.isMouseEventStart || this.isTouchEventStart) {
            this.startPosition = this.sliderModel[0];
            this.isHandlerActive = true;
        }
    }

    public onBarClick(event: MouseEvent): void {
        const size = this.bar.nativeElement.clientWidth;
        const val = event.clientX;
        const {left} = this.bar.nativeElement.getBoundingClientRect();
        const offset: number = Math.abs(val - left);
        const model = Math.round((offset / size) * (this.maxValue - this.minValue)) + this.minValue;

        this.setModelValue(model);
        requestAnimationFrame(this.setHandlerPosition.bind(this, false));
    }


    /*Method to calculate silder handler movement */

    /*Execute on events:
    * on-mousemove
    * on-panmove
    */
    public handlerSliding(event: any): void {
        if ((this.isMouseEventStart && event.clientX) || (this.isTouchEventStart && event.deltaX)) {
            const movedX = Math.round(((event.clientX || event.deltaX) - this.startClientX) / this.sliderWidth * this.totalDiff);
            const model = this.startPosition + movedX;
            if (model >= this.minValue && model <= this.maxValue) {
                this.setModelValue(model);
                requestAnimationFrame(this.setHandlerPosition.bind(this, false));
            }
        }
    }

}
