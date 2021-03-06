// @todo TypeScript doesn't know yet about globally available constructors.

interface Window { // tslint:disable-line:interface-name

    AudioBuffer: {

        prototype: AudioBuffer;

        new (options: AudioBufferOptions): AudioBuffer;

    };

    AudioContext: {

        prototype: AudioContext;

        new (contextOptions?: AudioContextOptions): AudioContext;

    };

    AudioWorkletNode: {

        prototype: AudioWorkletNode;

        new (context: BaseAudioContext, name: string, options?: AudioWorkletNodeOptions): AudioWorkletNode;

    };

    OfflineAudioContext: {

        prototype: OfflineAudioContext;

        new (contextOptions: OfflineAudioContextOptions): OfflineAudioContext;
        new (numberOfChannels: number, length: number, sampleRate: number): OfflineAudioContext;

    };

}
