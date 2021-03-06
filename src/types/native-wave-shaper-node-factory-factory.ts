import { TInvalidStateErrorFactory } from './invalid-state-error-factory';
import { TNativeAudioNodeFactory } from './native-audio-node-factory';
import { TNativeWaveShaperNodeFactory } from './native-wave-shaper-node-factory';
import { TNativeWaveShaperNodeFakerFactory } from './native-wave-shaper-node-faker-factory';

export type TNativeWaveShaperNodeFactoryFactory = (
    createInvalidStateError: TInvalidStateErrorFactory,
    createNativeAudioNode: TNativeAudioNodeFactory,
    createNativeWaveShaperNodeFaker: TNativeWaveShaperNodeFakerFactory
) => TNativeWaveShaperNodeFactory;
