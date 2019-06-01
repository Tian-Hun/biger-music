import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Howl, Howler } from 'howler';
import { NgForage } from 'ngforage';
import { BehaviorSubject, combineLatest, from, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Album, Progress, Song } from '@shared/types';
import { Direction, LoopMode } from '@shared/enums';

export const _playlistKey = 'PLAY_LIST';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {

    dataUrl = 'assets/data.json';
    albums: Array<Album>;
    songChange: BehaviorSubject<Song> = new BehaviorSubject<Song>(void (0));
    progress: Progress;

    private currentIndex = 0;
    private randomLoop = false;
    private _sound: Howl;
    private _playlist: Array<Song>;
    private _progressValue: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    private _progressTime: BehaviorSubject<string> = new BehaviorSubject<string>('00:00');
    private _progressLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    get progressValue(): Observable<number> {
        return this._progressValue.asObservable();
    }

    get progressTime(): Observable<string> {
        return this._progressTime.asObservable();
    }

    get progressLoaded(): Observable<boolean> {
        return this._progressLoaded.asObservable();
    }

    constructor(
        private http: HttpClient,
        private ngForage: NgForage
    ) {
        combineLatest(
            this.http.get(this.dataUrl)
                .pipe(
                    shareReplay(1),
                    map((data: any) => data.albums)
                ),
            from(this.ngForage.getItem(_playlistKey))
        )
            .pipe(map(([albums, songs]) => ({albums, songs})))
            .subscribe((data: {albums: Array<Album>, songs: Array<Song>}) => {
                this.albums = data.albums;
                this._playlist = data.songs || [];
                this.songChange.next(data.songs[0]);

                this.progress.duration = this.durationStr;

                if (!data.songs.length) {
                    this.ngForage.setItem(_playlistKey, data.albums[0].songs);
                }
            });

        this.progress = {
            duration: '',
            value: this.progressValue,
            time: this.progressTime,
            loaded: this.progressLoaded
        };
    }

    get sound(): Howl {
        const song = this._playlist[this.currentIndex];
        if (song.howl) {
            this._sound = song.howl;
        } else {
            this._sound = song.howl = new Howl({
                src: [song.url],
                html5: true,
                preload: true,
                onplay: () => requestAnimationFrame(this.step.bind(this)),
                onseek: () => requestAnimationFrame(this.step.bind(this)),
                onload: () => this._progressLoaded.next(true),
                onend: () => !this.sound.loop() && this.skip(this.randomLoop ? Direction.random : Direction.next),
            });
        }

        return this._sound;
    }

    private get durationStr(): string {
        return formatTime(Math.round(this.sound.duration()));
    }

    public play(index = 0): void {
        if (this.currentIndex !== index) {
            this.currentIndex = index;
            this.songChange.next(this._playlist[this.currentIndex]);
        }
        this.sound.play();
    }

    public pause(): void {
        this.sound.pause();
    }

    public skip(direction: Direction): void {
        let index = 0;
        if (direction === Direction.prev) {
            index = this.currentIndex - 1;
            if (index < 0) {
                index = this._playlist.length - 1;
            }
        } else if (direction === Direction.next) {
            index = this.currentIndex + 1;
            if (index >= this._playlist.length) {
                index = 0;
            }
        } else {
            index = randomNumber(0, this._playlist.length - 1);
        }

        this.skipTo(index);
    }

    public skipTo(index: number): void {
        const song = this._playlist[this.currentIndex];
        if (song.howl) {
            song.howl.stop();
        }

        this.play(index);
    }

    public loop(mode: LoopMode): void {
        const loopActions = [
            () => true,
            () => this.sound.loop(true),
            () => this.randomLoop = true
        ];

        loopActions[mode]();
    }

    public volume(value: number): void {
        Howler.volume(value);
    }

    public seek(percentage: number): void {
        this.sound.seek(this.sound.duration() * percentage);
    }

    public step(): void {
        const seek: number = (this.sound.seek() as number) || 0;
        this._progressTime.next(formatTime(Math.round(seek)));
        this._progressValue.next(Number((((seek / this.sound.duration()) * 100) || 0)));

        if (this.sound.playing()) {
            setTimeout(() => requestAnimationFrame(this.step.bind(this)), 500);
        }
    }
}

export function formatTime(secs): string {
    const minutes = Math.floor(secs / 60) || 0;
    const seconds = (secs - minutes * 60) || 0;

    return `${(minutes < 10 ? '0' : '') + minutes}:${(seconds < 10 ? '0' : '') + seconds}`;
}

export function randomNumber(minNum: number, maxNum: number): number {
    return Math.floor(Math.random() * (maxNum - minNum + 1) + minNum);
}
