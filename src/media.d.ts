/// <reference types="vite/client" />

/** Specialize MediaStreamTrack so that we can refer specifically to an audio track. */
interface MediaStreamAudioTrack extends MediaStreamTrack {
    readonly kind: 'audio';
    clone(): MediaStreamAudioTrack;
}

/** Specialize MediaStreamTrack so that we can refer specifically to a video track. */
interface MediaStreamVideoTrack extends MediaStreamTrack {
    readonly kind: 'video';
    clone(): MediaStreamVideoTrack;
}

/** Assert that getAudioTracks and getVideoTracks return the tracks with the appropriate kind. */
interface MediaStream {
    getTracks(): MediaStreamTrack[];
    getAudioTracks(): MediaStreamAudioTrack[];
    getVideoTracks(): MediaStreamVideoTrack[];
}

// The following were originally generated from the spec using
// https://github.com/microsoft/TypeScript-DOM-lib-generator, then heavily modified.

/**
 * A track sink that is capable of exposing the unencoded frames from the track to a
 * ReadableStream, and exposes a control channel for signals going in the oppposite direction.
 */
interface MediaStreamTrackProcessor<T extends AudioData | VideoFrame> {
    /**
     * Allows reading the frames flowing through the MediaStreamTrack provided to the constructor.
     */
    readonly readable: ReadableStream<T>;
    /** Allows sending control signals to the MediaStreamTrack provided to the constructor. */
    readonly writableControl: WritableStream<MediaStreamTrackSignal>;
}

interface MediaStreamTrackProcessorInit {
    track: MediaStreamTrack;
    /**
     * If media frames are not read from MediaStreamTrackProcessor.readable quickly enough, the
     * MediaStreamTrackProcessor will internally buffer up to maxBufferSize of the frames produced
     * by the track. If the internal buffer is full, each time the track produces a new frame, the
     * oldest frame in the buffer will be dropped and the new frame will be added to the buffer.
     */
    maxBufferSize?: number | undefined;
}

interface MediaStreamVideoTrackProcessorInit
    extends MediaStreamTrackProcessorInit {
    track: MediaStreamVideoTrack;
}
interface MediaStreamAudioTrackProcessorInit
    extends MediaStreamTrackProcessorInit {
    track: MediaStreamAudioTrack;
}

/**
 * Takes video frames as input, and emits control signals that result from subsequent processing.
 */
interface MediaStreamTrackGenerator<T extends AudioData | VideoFrame>
    extends MediaStreamTrack {
    /**
     * Allows writing media frames to the MediaStreamTrackGenerator, which is itself a
     * MediaStreamTrack. When a frame is written to writable, the frame’s close() method is
     * automatically invoked, so that its internal resources are no longer accessible from
     * JavaScript.
     */
    readonly writable: WritableStream<T>;
    /**
     * Allows reading control signals sent from any sinks connected to the
     * MediaStreamTrackGenerator.
     */
    readonly readableControl: ReadableStream<MediaStreamTrackSignal>;
}

type MediaStreamAudioTrackGenerator = MediaStreamTrackGenerator<AudioData> &
    MediaStreamAudioTrack;
type MediaStreamVideoTrackGenerator = MediaStreamTrackGenerator<VideoFrame> &
    MediaStreamVideoTrack;

interface MediaStreamTrackGeneratorInit {
    kind: MediaStreamTrackGeneratorKind;
    /**
     * (Optional) track to which the MediaStreamTrackGenerator will automatically forward control
     * signals. If signalTarget is provided and signalTarget.kind and kind do not match, the
     * MediaStreamTrackGenerator’s constructor will raise an exception.
     */
    signalTarget?: MediaStreamTrack | undefined;
}

type MediaStreamTrackGeneratorKind = 'audio' | 'video';

type MediaStreamTrackSignalType = 'request-frame';

interface MediaStreamTrackSignal {
    signalType: MediaStreamTrackSignalType;
}

interface MediaStreamAudioTrackGeneratorInit
    extends MediaStreamTrackGeneratorInit {
    kind: 'audio';
    signalTarget?: MediaStreamAudioTrack | undefined;
}

interface MediaStreamVideoTrackGeneratorInit
    extends MediaStreamTrackGeneratorInit {
    kind: 'video';
    signalTarget?: MediaStreamVideoTrack | undefined;
}

const MediaStreamTrackProcessor: {
    prototype: MediaStreamTrackProcessor<AudioData | VideoFrame>;

    /** Constructor overrides based on the type of track. */
    new (
        init: MediaStreamAudioTrackProcessorInit
    ): MediaStreamTrackProcessor<AudioData>;
    new (
        init: MediaStreamVideoTrackProcessorInit
    ): MediaStreamTrackProcessor<VideoFrame>;
    new (
        init:
            | MediaStreamVideoTrackProcessorInit
            | MediaStreamAudioTrackProcessorInit
    ): MediaStreamTrackProcessor<never>;
};
const MediaStreamTrackGenerator: {
    prototype: MediaStreamTrackGenerator<AudioData | VideoFrame>;

    /** Constructor overrides based on the type of track. */
    new (
        init: MediaStreamAudioTrackGeneratorInit
    ): MediaStreamAudioTrackGenerator;
    new (
        init: MediaStreamVideoTrackGeneratorInit
    ): MediaStreamVideoTrackGenerator;
    new (
        init:
            | MediaStreamAudioTrackGeneratorInit
            | MediaStreamVideoTrackGeneratorInit
    ): never;
};

declare module '*.mp4';
