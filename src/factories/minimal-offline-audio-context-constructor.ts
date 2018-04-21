import { IAudioBuffer, IMinimalOfflineAudioContext, IOfflineAudioContextOptions } from '../interfaces';
import { TAudioContextState, TMinimalOfflineAudioContextConstructorFactory, TNativeOfflineAudioContext } from '../types';
import { wrapAudioBufferCopyChannelMethods } from '../wrappers/audio-buffer-copy-channel-methods';

const DEFAULT_OPTIONS = {
    numberOfChannels: 1
};

export const createMinimalOfflineAudioContextConstructor: TMinimalOfflineAudioContextConstructorFactory = (
    createInvalidStateError,
    minimalBaseAudioContextConstructor,
    nativeOfflineAudioContextConstructor,
    startRendering
) => {

    return class MinimalOfflineAudioContext extends minimalBaseAudioContextConstructor implements IMinimalOfflineAudioContext {

        private _length: number;

        private _nativeOfflineAudioContext: TNativeOfflineAudioContext;

        private _state: null | TAudioContextState;

        constructor (options: IOfflineAudioContextOptions) {
            if (nativeOfflineAudioContextConstructor === null) {
                throw new Error(); // @todo
            }

            const { length, numberOfChannels, sampleRate } = <typeof DEFAULT_OPTIONS & IOfflineAudioContextOptions> {
                ...DEFAULT_OPTIONS,
                ...options
            };

            const nativeOfflineAudioContext = new nativeOfflineAudioContextConstructor(numberOfChannels, length, sampleRate);

            super(nativeOfflineAudioContext, numberOfChannels);

            this._length = length;
            this._nativeOfflineAudioContext = nativeOfflineAudioContext;
            this._state = null;
        }

        public get length () {
            // Bug #17: Safari does not yet expose the length.
            if (this._nativeOfflineAudioContext.length === undefined) {
                return this._length;
            }

            return this._nativeOfflineAudioContext.length;
        }

        public get state () {
            return (this._state === null) ? this._nativeOfflineAudioContext.state : this._state;
        }

        public startRendering () {
            /*
             * Bug #9 & #59: It is theoretically possible that startRendering() will first render a partialOfflineAudioContext. Therefore
             * the state of the nativeOfflineAudioContext might no transition to running immediately.
             */
            if (this._state === 'running') {
                return Promise.reject(createInvalidStateError());
            }

            this._state = 'running';

            return startRendering(this.destination, this._nativeOfflineAudioContext)
                .then((audioBuffer) => {
                    // Bug #5: Safari does not support copyFromChannel() and copyToChannel().
                    if (typeof audioBuffer.copyFromChannel !== 'function') {
                        wrapAudioBufferCopyChannelMethods(audioBuffer);
                    }

                    this._state = null;

                    return <IAudioBuffer> audioBuffer;
                })
                // @todo This could be written more elegantly when Promise.finally() becomes avalaible.
                .catch((err) => {
                    this._state = null;

                    throw err;
                });
        }

    };

};
