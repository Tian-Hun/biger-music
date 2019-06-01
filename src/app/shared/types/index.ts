import { Observable } from 'rxjs';
import { Howl } from 'howler';

export interface Song {
    thumb: string;
    url: string;
    title: string;
    artist: string;
    lyric: string;
    howl: Howl;
    [propName: string]: any;
}

export interface Album {
    cover: string;
    name: string;
    issueDate: string;
    songs: Array<Song>;
}

export interface Progress {
    duration: string;
    value: Observable<number>;
    time: Observable<string>;
    loaded: Observable<boolean>;
}
