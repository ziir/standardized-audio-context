import { TAudioWorkletNodeRendererFactory } from './audio-worklet-node-renderer-factory';
import { TConnectMultipleOutputsFunction } from './connect-multiple-outputs-function';
import { TDisconnectMultipleOutputsFunction } from './disconnect-multiple-outputs-function';
import { TNativeAudioBufferSourceNodeFactory } from './native-audio-buffer-source-node-factory';
import { TNativeAudioWorkletNodeConstructor } from './native-audio-worklet-node-constructor';
import { TNativeChannelMergerNodeFactory } from './native-channel-merger-node-factory';
import { TNativeChannelSplitterNodeFactory } from './native-channel-splitter-node-factory';
import { TNativeConstantSourceNodeFactory } from './native-constant-source-node-factory';
import { TNativeGainNodeFactory } from './native-gain-node-factory';
import { TNativeOfflineAudioContextConstructor } from './native-offline-audio-context-constructor';
import { TRenderNativeOfflineAudioContextFunction } from './render-native-offline-audio-context-function';

export type TAudioWorkletNodeRendererFactoryFactory = (
    connectMultipleOutputs: TConnectMultipleOutputsFunction,
    createNativeAudioBufferSourceNode: TNativeAudioBufferSourceNodeFactory,
    createNativeChannelMergerNode: TNativeChannelMergerNodeFactory,
    createNativeChannelSplitterNode: TNativeChannelSplitterNodeFactory,
    createNativeConstantSourceNode: TNativeConstantSourceNodeFactory,
    createNativeGainNode: TNativeGainNodeFactory,
    disconnectMultipleOutputs: TDisconnectMultipleOutputsFunction,
    nativeAudioWorkletNodeConstructor: null | TNativeAudioWorkletNodeConstructor,
    nativeOfflineAudioContextConstructor: null | TNativeOfflineAudioContextConstructor,
    renderNativeOfflineAudioContext: TRenderNativeOfflineAudioContextFunction
) => TAudioWorkletNodeRendererFactory;
