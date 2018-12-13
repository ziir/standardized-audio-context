import { getNativeContext } from '../helpers/get-native-context';
import { IAudioParam, IOscillatorNode, IOscillatorNodeRenderer, IOscillatorOptions } from '../interfaces';
import { TContext, TEndedEventHandler, TNativeOscillatorNode, TOscillatorNodeConstructorFactory, TOscillatorType } from '../types';

// The DEFAULT_OPTIONS are only of type Partial<IOscillatorOptions> because there is no default value for periodicWave.
const DEFAULT_OPTIONS: Partial<IOscillatorOptions> = {
    channelCount: 2,
    channelCountMode: 'max', // This attribute has no effect for nodes with no inputs.
    channelInterpretation: 'speakers', // This attribute has no effect for nodes with no inputs.
    detune: 0,
    frequency: 440,
    type: 'sine'
};

export const createOscillatorNodeConstructor: TOscillatorNodeConstructorFactory = (
    createAudioParam,
    createInvalidStateError,
    createNativeOscillatorNode,
    createOscillatorNodeRenderer,
    isNativeOfflineAudioContext,
    noneAudioDestinationNodeConstructor
) => {

    return  class OscillatorNode extends noneAudioDestinationNodeConstructor implements IOscillatorNode {

        private _detune: IAudioParam;

        private _frequency: IAudioParam;

        private _nativeOscillatorNode: TNativeOscillatorNode;

        private _oscillatorNodeRenderer: null | IOscillatorNodeRenderer;

        constructor (context: TContext, options: Partial<IOscillatorOptions> = DEFAULT_OPTIONS) {
            const absoluteValue = 1200 * Math.log2(context.sampleRate);
            const nativeContext = getNativeContext(context);
            const mergedOptions = <IOscillatorOptions> { ...DEFAULT_OPTIONS, ...options };
            const nativeOscillatorNode = createNativeOscillatorNode(nativeContext, mergedOptions);
            const isOffline = isNativeOfflineAudioContext(nativeContext);
            const oscillatorNodeRenderer = (isOffline) ? createOscillatorNodeRenderer() : null;
            const nyquist = context.sampleRate / 2;

            super(context, nativeOscillatorNode, oscillatorNodeRenderer);

            // Bug #81: Edge & Safari do not export the correct values for maxValue and minValue.
            this._detune = createAudioParam(context, isOffline, nativeOscillatorNode.detune, absoluteValue, -absoluteValue);
            // Bug #76: Edge & Safari do not export the correct values for maxValue and minValue.
            this._frequency = createAudioParam(context, isOffline, nativeOscillatorNode.frequency, nyquist, -nyquist);
            this._nativeOscillatorNode = nativeOscillatorNode;
            this._oscillatorNodeRenderer = oscillatorNodeRenderer;

            if (this._oscillatorNodeRenderer !== null && mergedOptions.periodicWave) {
                this._oscillatorNodeRenderer.periodicWave = mergedOptions.periodicWave;
            }
        }

        public get detune (): IAudioParam {
            return this._detune;
        }

        public get frequency (): IAudioParam {
            return this._frequency;
        }

        public get onended (): null | TEndedEventHandler {
            return <null | TEndedEventHandler> this._nativeOscillatorNode.onended;
        }

        public set onended (value) {
            this._nativeOscillatorNode.onended = <TNativeOscillatorNode['onended']> value;
        }

        public get type (): TOscillatorType {
            return this._nativeOscillatorNode.type;
        }

        public set type (value) {
            this._nativeOscillatorNode.type = value;

            // Bug #57: Edge will not throw an error when assigning the type to 'custom'. But it still will change the value.
            if (value === 'custom') {
                throw createInvalidStateError();
            }

            if (this._oscillatorNodeRenderer !== null) {
                this._oscillatorNodeRenderer.periodicWave = null;
            }
        }

        public setPeriodicWave (periodicWave: PeriodicWave): void {
            this._nativeOscillatorNode.setPeriodicWave(periodicWave);

            if (this._oscillatorNodeRenderer !== null) {
                this._oscillatorNodeRenderer.periodicWave = periodicWave;
            }
        }

        public start (when = 0): void {
            this._nativeOscillatorNode.start(when);

            if (this._oscillatorNodeRenderer !== null) {
                this._oscillatorNodeRenderer.start = when;
            }
        }

        public stop (when = 0): void {
            this._nativeOscillatorNode.stop(when);

            if (this._oscillatorNodeRenderer !== null) {
                this._oscillatorNodeRenderer.stop = when;
            }
        }

    };

};
