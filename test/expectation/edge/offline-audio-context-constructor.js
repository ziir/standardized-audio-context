import 'core-js/es7/reflect';
import { UNPATCHED_OFFLINE_AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER, unpatchedOfflineAudioContextConstructor } from '../../../src/providers/unpatched-offline-audio-context-constructor';
import { ReflectiveInjector } from '@angular/core';
import { WINDOW_PROVIDER } from '../../../src/providers/window';

describe('offlineAudioContextConstructor', () => {

    var offlineAudioContext,
        OfflineAudioContext;

    beforeEach(() => {
        /* eslint-disable indent */
        var injector = ReflectiveInjector.resolveAndCreate([
                UNPATCHED_OFFLINE_AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER,
                WINDOW_PROVIDER
            ]);
        /* eslint-enable indent */

        OfflineAudioContext = injector.get(unpatchedOfflineAudioContextConstructor);

        offlineAudioContext = new OfflineAudioContext(1, 256000, 44100);
    });

    describe('length', () => {

        // bug #17

        it('should not expose its length', () => {
            expect(offlineAudioContext.length).to.be.undefined;
        });

    });

    describe('createAnalyser()', () => {

        // bug #11

        it('should not be chainable', () => {
            var analyserNode = offlineAudioContext.createAnalyser(),
                gainNode = offlineAudioContext.createGain();

            expect(analyserNode.connect(gainNode)).to.be.undefined;
        });

    });

    describe('createBiquadFilter()', () => {

        // bug #11

        it('should not be chainable', () => {
            var biquadFilterNode = offlineAudioContext.createBiquadFilter(),
                gainNode = offlineAudioContext.createGain();

            expect(biquadFilterNode.connect(gainNode)).to.be.undefined;
        });

        describe('getFrequencyResponse()', () => {

            // bug #22

            it('should fill the magResponse and phaseResponse arrays with the deprecated algorithm', () => {
                var biquadFilterNode = offlineAudioContext.createBiquadFilter(),
                    magResponse = new Float32Array(5),
                    phaseResponse = new Float32Array(5);

                biquadFilterNode.getFrequencyResponse(new Float32Array([ 200, 400, 800, 1600, 3200 ]), magResponse, phaseResponse);

                expect(Array.from(magResponse)).to.deep.equal([ 1.1107852458953857, 0.8106917142868042, 0.20565471053123474, 0.04845593497157097, 0.011615658178925514 ]);
                expect(Array.from(phaseResponse)).to.deep.equal([ -0.7254799008369446, -1.8217267990112305, -2.6273605823516846, -2.906902313232422, -3.0283825397491455 ]);
            });

        });

    });

    describe('createBufferSource()', () => {

        // bug #11

        it('should not be chainable', () => {
            var audioBufferSourceNode = offlineAudioContext.createBufferSource(),
                gainNode = offlineAudioContext.createGain();

            expect(audioBufferSourceNode.connect(gainNode)).to.be.undefined;
        });

        // bug #14

        it('should not resample an oversampled AudioBuffer', (done) => {
            var audioBuffer = offlineAudioContext.createBuffer(1, 8, 88200),
                audioBufferSourceNode = offlineAudioContext.createBufferSource(),
                eightRandomValues = [];

            for (let i = 0; i < 8; i += 1) {
                eightRandomValues[i] = (Math.random() * 2) - 1;
            }

            audioBuffer.copyToChannel(new Float32Array(eightRandomValues), 0);

            audioBufferSourceNode.buffer = audioBuffer;
            audioBufferSourceNode.start(0);
            audioBufferSourceNode.connect(offlineAudioContext.destination);

            offlineAudioContext
                .startRendering()
                .then((buffer) => {
                    var channelData = new Float32Array(4);

                    buffer.copyFromChannel(channelData, 0);

                    expect(channelData[0]).to.closeTo(eightRandomValues[0], 0.0000001);
                    expect(channelData[1]).to.closeTo(eightRandomValues[2], 0.0000001);
                    expect(channelData[2]).to.closeTo(eightRandomValues[4], 0.0000001);
                    expect(channelData[3]).to.closeTo(eightRandomValues[6], 0.0000001);

                    done();
                });
        });

    });

    describe('createChannelMerger()', () => {

        // bug #11

        it('should not be chainable', () => {
            var channelMergerNode = offlineAudioContext.createChannelMerger(),
                gainNode = offlineAudioContext.createGain();

            expect(channelMergerNode.connect(gainNode)).to.be.undefined;
        });

    });

    describe('createChannelSplitter()', () => {

        // bug #11

        it('should not be chainable', () => {
            var channelSplitterNode = offlineAudioContext.createChannelSplitter(),
                gainNode = offlineAudioContext.createGain();

            expect(channelSplitterNode.connect(gainNode)).to.be.undefined;
        });

        // bug #29

        it('should have a channelCountMode of max', () => {
            var channelSplitterNode = offlineAudioContext.createChannelSplitter();

            expect(channelSplitterNode.channelCountMode).to.equal('max');
        });

        // bug #30

        it('should allow to set the channelCountMode', () => {
            var channelSplitterNode = offlineAudioContext.createChannelSplitter();

            channelSplitterNode.channelCountMode = 'explicit';
        });

        // bug #31

        it('should have a channelInterpretation of max', () => {
            var channelSplitterNode = offlineAudioContext.createChannelSplitter();

            expect(channelSplitterNode.channelInterpretation).to.equal('speakers');
        });

        // bug #32

        it('should allow to set the channelInterpretation', () => {
            var channelSplitterNode = offlineAudioContext.createChannelSplitter();

            channelSplitterNode.channelInterpretation = 'discrete';
        });

    });

    describe('createGain()', () => {

        // bug #11

        it('should not be chainable', () => {
            var gainNodeA = offlineAudioContext.createGain(),
                gainNodeB = offlineAudioContext.createGain();

            expect(gainNodeA.connect(gainNodeB)).to.be.undefined;
        });

        describe('cancelAndHoldAtTime()', () => {

            var gainNode;

            beforeEach(() => {
                gainNode = offlineAudioContext.createGain();
            });

            // bug #28

            it('should not be implemented', () => {
                expect(gainNode.cancelAndHoldAtTime).to.be.undefined;
            });

        });

    });

    describe('createIIRFilter()', () => {

        // bug #9

        it('should not be implemented', () => {
            expect(offlineAudioContext.createIIRFilter).to.be.undefined;
        });

    });

    describe('createOscillator()', () => {

        // bug #11

        it('should not be chainable', () => {
            var gainNode = offlineAudioContext.createGain(),
                oscillatorNode = offlineAudioContext.createOscillator();

            expect(oscillatorNode.connect(gainNode)).to.be.undefined;
        });

    });

    describe('decodeAudioData()', () => {

        // bug #27

        it('should reject the promise with a DOMException', (done) => {
            offlineAudioContext
                .decodeAudioData(null)
                .catch((err) => {
                    expect(err).to.be.an.instanceOf(DOMException);

                    done();
                });
        });

    });

});
