import { cacheTestResult } from '../helpers/cache-test-result';
import { IAudioBuffer, IMinimalOfflineAudioContext, IOfflineAudioContextOptions } from '../interfaces';
import { testPromiseSupport } from '../support-testers/promise';
import { TAudioContextState, TMinimalOfflineAudioContextConstructorFactory, TNativeOfflineAudioContext } from '../types';

const DEFAULT_OPTIONS = {
    numberOfChannels: 1
};

export const createMinimalOfflineAudioContextConstructor: TMinimalOfflineAudioContextConstructorFactory = (
    createInvalidStateError,
    createNativeOfflineAudioContext,
    minimalBaseAudioContextConstructor,
    startRendering
) => {

    return class MinimalOfflineAudioContext extends minimalBaseAudioContextConstructor implements IMinimalOfflineAudioContext {

        private _length: number;

        private _nativeOfflineAudioContext: TNativeOfflineAudioContext;

        private _state: null | TAudioContextState;

        constructor (options: IOfflineAudioContextOptions) {
            const { length, numberOfChannels, sampleRate } = <typeof DEFAULT_OPTIONS & IOfflineAudioContextOptions> {
                ...DEFAULT_OPTIONS,
                ...options
            };

            const nativeOfflineAudioContext = createNativeOfflineAudioContext(numberOfChannels, length, sampleRate);

            // #21 Safari does not support promises and therefore would fire the statechange event before the promise can be resolved.
            if (!cacheTestResult(
                testPromiseSupport,
                () => testPromiseSupport(nativeOfflineAudioContext)
            )) {
                nativeOfflineAudioContext.addEventListener('statechange', (() => {
                    let i = 0;

                    const delayStateChangeEvent = (event: Event) => {
                        if (this._state === 'running') {
                            if (i > 0) {
                                nativeOfflineAudioContext.removeEventListener('statechange', delayStateChangeEvent);
                                event.stopImmediatePropagation();

                                this._waitForThePromiseToSettle(event);
                            } else {
                                i += 1;
                            }
                        }
                    };

                    return delayStateChangeEvent;
                })());
            }

            super(nativeOfflineAudioContext, numberOfChannels);

            this._length = length;
            this._nativeOfflineAudioContext = nativeOfflineAudioContext;
            this._state = null;
        }

        get length (): number {
            // Bug #17: Safari does not yet expose the length.
            if (this._nativeOfflineAudioContext.length === undefined) {
                return this._length;
            }

            return this._nativeOfflineAudioContext.length;
        }

        get state (): TAudioContextState {
            return (this._state === null) ? this._nativeOfflineAudioContext.state : this._state;
        }

        public startRendering (): Promise<IAudioBuffer> {
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
                    this._state = null;

                    /*
                     * Bug #50: Deleting the AudioGraph is currently not possible anymore.
                     * deleteAudioGraph(this, this._nativeOfflineAudioContext);
                     */

                    return <IAudioBuffer> audioBuffer;
                })
                // @todo This could be written more elegantly when Promise.finally() becomes avalaible.
                .catch((err) => {
                    this._state = null;

                    /*
                     * Bug #50: Deleting the AudioGraph is currently not possible anymore.
                     * deleteAudioGraph(this, this._nativeOfflineAudioContext);
                     */

                    throw err; // tslint:disable-line:rxjs-throw-error
                });
        }

        private _waitForThePromiseToSettle (event: Event): void {
            if (this._state === null) {
                this._nativeOfflineAudioContext.dispatchEvent(event);
            } else {
                setTimeout(() => this._waitForThePromiseToSettle(event));
            }
        }

    };

};
