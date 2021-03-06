import { TNativeAudioDestinationNodeFactory } from '../types';

export const createNativeAudioDestinationNode: TNativeAudioDestinationNodeFactory = (
    nativeContext,
    channelCount,
    isNodeOfNativeOfflineAudioContext
) => {
    const nativeAudioDestinationNode = nativeContext.destination;

    // Bug #132: Edge & Safari do not have the correct channelCount.
    if (nativeAudioDestinationNode.channelCount !== channelCount) {
        nativeAudioDestinationNode.channelCount = channelCount;
    }

    // Bug #83: Edge & Safari do not have the correct channelCountMode.
    if (isNodeOfNativeOfflineAudioContext && nativeAudioDestinationNode.channelCountMode !== 'explicit') {
        nativeAudioDestinationNode.channelCountMode = 'explicit';
    }

    // Bug #47: The AudioDestinationNode in Edge and Safari does not initialize the maxChannelCount property correctly.
    if (nativeAudioDestinationNode.maxChannelCount === 0) {
        Object.defineProperty(nativeAudioDestinationNode, 'maxChannelCount', {
            get: () => nativeAudioDestinationNode.channelCount
        });
    }

    return nativeAudioDestinationNode;
};
