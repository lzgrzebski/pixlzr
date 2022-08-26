import React, { useRef, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const isVideoTrack = (
    track: MediaStreamTrack
): track is MediaStreamVideoTrack => track && track.kind === 'video';

const Pixlzr = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const width = 640;
        const height = 480;
        const abortController = new AbortController();
        const offscreenCanvas = new OffscreenCanvas(width, height);
        const offscreenContext = offscreenCanvas.getContext('2d');

        navigator.mediaDevices
            .getUserMedia({
                video: { height, width },
            })
            .then((stream) => {
                const signal = abortController.signal;
                const [track] = stream.getVideoTracks();
                if (isVideoTrack(track)) {
                    const processor = new MediaStreamTrackProcessor({ track });
                    const generator = new MediaStreamTrackGenerator({
                        kind: 'video',
                    });

                    processor.readable
                        .pipeThrough(
                            new TransformStream({
                                transform: async (videoFrame, controller) => {
                                    offscreenContext?.drawImage(
                                        videoFrame,
                                        0,
                                        0
                                    );

                                    const imageData =
                                        offscreenContext?.getImageData(
                                            0,
                                            0,
                                            width,
                                            height
                                        );

                                    if (!imageData) {
                                        return;
                                    }

                                    // Mutate existing buffer for now
                                    FloydSteinbergDithering(
                                        imageData,
                                        width,
                                        height
                                    );

                                    offscreenContext?.putImageData(
                                        imageData,
                                        0,
                                        0
                                    );
                                    videoFrame.close();
                                    const timestamp = videoFrame.timestamp ?? 0;
                                    controller.enqueue(
                                        new VideoFrame(
                                            offscreenCanvas as unknown as CanvasImageSource,
                                            {
                                                timestamp,
                                            }
                                        )
                                    );
                                    return;
                                },
                            }),
                            { signal }
                        )
                        .pipeTo(generator.writable, {
                            signal,
                        })
                        .catch((error) => {
                            console.error(error);
                        });

                    const pixlzrStream = new MediaStream([generator]);
                    if (videoRef.current) {
                        videoRef.current.srcObject = pixlzrStream;
                    }
                }
            });

        return () => {
            abortController.abort('Cleanup');
            const stream = videoRef.current?.srcObject;
            if (stream) {
                (stream as MediaStream)
                    .getTracks()
                    .forEach((track) => track.stop());
            }
        };
    }, []);

    return (
        <video
            autoPlay
            muted
            ref={videoRef}
            style={{
                display: 'block',
                height: '100vh',
                objectFit: 'cover',
                width: '100vw',
            }}
        />
    );
};

const FloydSteinbergDithering = (
    imageData: ImageData,
    width: number,
    height: number
) => {
    const index = (x: number, y: number) => (x + y * width) * 4;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = index(x, y);

            const r = imageData?.data[i] ?? 0;
            const g = imageData?.data[i + 1] ?? 0;
            const b = imageData?.data[i + 2] ?? 0;

            const factor = 1;

            const newR = Math.round((factor * r) / 255) * (255 / factor);
            const newG = Math.round((factor * g) / 255) * (255 / factor);
            const newB = Math.round((factor * b) / 255) * (255 / factor);

            imageData.data[i] = newR;
            imageData.data[i + 1] = newG;
            imageData.data[i + 2] = newB;

            const errR = r - newR;
            const errG = g - newG;
            const errB = b - newB;

            // x+1
            imageData.data[index(x + 1, y)] =
                imageData?.data[index(x + 1, y)] + (errR * 7) / 16;

            imageData.data[index(x + 1, y) + 1] =
                imageData?.data[index(x + 1, y) + 1] + (errG * 7) / 16;

            imageData.data[index(x + 1, y) + 2] =
                imageData?.data[index(x + 1, y) + 1] + (errB * 7) / 16;

            // x-1,y+1
            imageData.data[index(x - 1, y + 1)] =
                imageData?.data[index(x - 1, y + 1)] + (errR * 3) / 16;

            imageData.data[index(x - 1, y + 1) + 1] =
                imageData?.data[index(x - 1, y + 1) + 1] + (errG * 3) / 16;

            imageData.data[index(x - 1, y + 1) + 2] =
                imageData?.data[index(x - 1, y + 1) + 1] + (errB * 3) / 16;

            // x,y+1
            imageData.data[index(x, y + 1)] =
                imageData?.data[index(x, y + 1)] + (errR * 5) / 16;

            imageData.data[index(x, y + 1) + 1] =
                imageData?.data[index(x, y + 1) + 1] + (errG * 5) / 16;

            imageData.data[index(x, y + 1) + 2] =
                imageData?.data[index(x, y + 1) + 1] + (errB * 5) / 16;

            // x+1,y+1
            imageData.data[index(x + 1, y + 1)] =
                imageData?.data[index(x + 1, y + 1)] + (errR * 1) / 16;

            imageData.data[index(x + 1, y + 1) + 1] =
                imageData?.data[index(x + 1, y + 1) + 1] + (errG * 1) / 16;

            imageData.data[index(x + 1, y + 1) + 2] =
                imageData?.data[index(x + 1, y + 1) + 1] + (errB * 1) / 16;
        }
    }
};

const PixlzrWithErrorBoundary = () => (
    <ErrorBoundary
        fallbackRender={(props) => (
            <div>
                <p>
                    Was a bit lazy to get it working without MediaTrackGenerator
                    and OffscreenCanvas.
                    <br />
                    Best to check it in chrome before I make it backward
                    compatible ;){' '}
                </p>
                <code>{props.error.toString()}</code>
            </div>
        )}
    >
        <Pixlzr />
    </ErrorBoundary>
);

export { PixlzrWithErrorBoundary as Pixlzr };
