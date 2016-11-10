import 'core-js/es7/reflect';
import { UNPATCHED_OFFLINE_AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER, unpatchedOfflineAudioContextConstructor } from '../../../src/providers/unpatched-offline-audio-context-constructor';
import { ReflectiveInjector } from '@angular/core';
import { WINDOW_PROVIDER } from '../../../src/providers/window';
import { loadFixture } from '../../helper/load-fixture';

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

        offlineAudioContext = new OfflineAudioContext(1, 25600, 44100);
    });

    it('should not provide an unprefixed constructor', () => {
        expect(window.OfflineAudioContext).to.be.undefined;
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

                // @todo Use AudioBuffer.prototype.copyToChannel() once it lands in Safari.
                audioBuffer.getChannelData(0)[i] = eightRandomValues[i];
            }

            audioBufferSourceNode.buffer = audioBuffer;
            audioBufferSourceNode.start(0);
            audioBufferSourceNode.connect(offlineAudioContext.destination);

            offlineAudioContext.oncomplete = (event) => {
                // @todo Use AudioBuffer.prototype.copyFromChannel() once it lands in Safari.
                var channelData = event.renderedBuffer.getChannelData(0);

                expect(channelData[0]).to.closeTo(eightRandomValues[0], 0.0000001);
                expect(channelData[1]).to.closeTo(eightRandomValues[2], 0.0000001);
                expect(channelData[2]).to.closeTo(eightRandomValues[4], 0.0000001);
                expect(channelData[3]).to.closeTo(eightRandomValues[6], 0.0000001);

                done();
            };
            offlineAudioContext.startRendering();
        });

        // bug #18

        it('should not allow calls to stop() of an AudioBufferSourceNode scheduled for stopping', () => {
            var audioBuffer = offlineAudioContext.createBuffer(1, 100, 44100),
                audioBufferSourceNode = offlineAudioContext.createBufferSource();

            audioBufferSourceNode.buffer = audioBuffer;
            audioBufferSourceNode.connect(offlineAudioContext.destination);
            audioBufferSourceNode.start();
            audioBufferSourceNode.stop(1);
            expect(() => {
                audioBufferSourceNode.stop();
            }).to.throw(Error);
        });

        // bug #19

        it('should not ignore calls to stop() of an already stopped AudioBufferSourceNode', (done) => {
            var audioBuffer = offlineAudioContext.createBuffer(1, 100, 44100),
                audioBufferSourceNode = offlineAudioContext.createBufferSource();

            audioBufferSourceNode.onended = () => {
                expect(() => {
                    audioBufferSourceNode.stop();
                }).to.throw(Error);

                done();
            };

            audioBufferSourceNode.buffer = audioBuffer;
            audioBufferSourceNode.connect(offlineAudioContext.destination);
            audioBufferSourceNode.start();
            audioBufferSourceNode.stop();

            offlineAudioContext.startRendering();
        });

    });

    describe('createChannelMerger()', () => {

        // bug #11

        it('should not be chainable', () => {
            var channelMergerNode = offlineAudioContext.createChannelMerger(),
                gainNode = offlineAudioContext.createGain();

            expect(channelMergerNode.connect(gainNode)).to.be.undefined;
        });

        // bug #15

        it('should have a wrong channelCount', () => {
            var channelMergerNode = offlineAudioContext.createChannelMerger();

            expect(channelMergerNode.channelCount).to.not.equal(1);
        });

        it('should have a wrong channelCountMode', () => {
            var channelMergerNode = offlineAudioContext.createChannelMerger();

            expect(channelMergerNode.channelCountMode).to.not.equal('explicit');
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

        // bug #12

        it('should not allow to disconnect a specific destination', (done) => {
            var candidate,
                dummy,
                ones,
                source;

            candidate = offlineAudioContext.createGain();
            dummy = offlineAudioContext.createGain();

            // Safari does not play buffers which contain just one frame.
            ones = offlineAudioContext.createBuffer(1, 2, 44100);
            ones.getChannelData(0)[0] = 1;
            ones.getChannelData(0)[1] = 1;

            source = offlineAudioContext.createBufferSource();
            source.buffer = ones;

            source.connect(candidate);
            candidate.connect(offlineAudioContext.destination);
            candidate.connect(dummy);
            candidate.disconnect(dummy);

            source.start();

            offlineAudioContext.oncomplete = (event) => {
                var channelData = event.renderedBuffer.getChannelData(0);

                expect(channelData[0]).to.equal(0);

                source.disconnect(candidate);
                candidate.disconnect(offlineAudioContext.destination);

                done();
            };
            offlineAudioContext.startRendering();
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

    describe('createScriptProcessor()', () => {

        // bug #8

        it('should not fire onaudioprocess for every buffer', (done) => {
            var scriptProcessorNode = offlineAudioContext.createScriptProcessor(256, 1, 1);

            scriptProcessorNode.connect(offlineAudioContext.destination);
            scriptProcessorNode.onaudioprocess = sinon.stub(); // eslint-disable-line no-undef

            offlineAudioContext.oncomplete = () => {
                expect(scriptProcessorNode.onaudioprocess.callCount).to.be.below(1000);

                done();
            };
            offlineAudioContext.startRendering();
        });

        // bug #13

        it('should not have any output', (done) => {
            var scriptProcessorNode = offlineAudioContext.createScriptProcessor(256, 1, 1);

            scriptProcessorNode.connect(offlineAudioContext.destination);
            scriptProcessorNode.onaudioprocess = (event) => {
                // @todo Use AudioBuffer.prototype.copyToChannel() and TypedArray.prototype.fill()
                // once they land in Safari.
                var channelData = event.outputBuffer.getChannelData(0);

                Array.prototype.forEach.call(channelData, (element, index) => {
                    channelData[index] = 1;
                });
            };

            offlineAudioContext.oncomplete = (event) => {
                // @todo Use AudioBuffer.prototype.copyFromChannel() once it lands in Safari.
                var channelData = event.renderedBuffer.getChannelData(0);

                expect(Array.from(channelData)).to.not.contain(1);

                done();
            };
            offlineAudioContext.startRendering();
        });

    });

    describe('decodeAudioData()', () => {

        // bug #1

        it('should require the success callback function as a parameter', (done) => {
            loadFixture('1000-frames-of-noise.wav', (err, arrayBuffer) => {
                expect(err).to.be.null;

                expect(() => {
                    offlineAudioContext.decodeAudioData(arrayBuffer);
                }).to.throw(TypeError, 'Not enough arguments');

                done();
            });
        });

        // bug #4

        it('should throw null when asked to decode an unsupported file', function (done) {
            this.timeout(5000);

            // PNG files are not supported by any browser :-)
            loadFixture('one-pixel-of-transparency.png', (err, arrayBuffer) => {
                expect(err).to.be.null;

                offlineAudioContext.decodeAudioData(arrayBuffer, () => {}, (err) => {
                    expect(err).to.be.null;

                    done();
                });
            });
        });

        // bug #5

        it('should return an AudioBuffer without copyFromChannel() and copyToChannel() methods', (done) => {
            loadFixture('1000-frames-of-noise.wav', (err, arrayBuffer) => {
                expect(err).to.be.null;

                offlineAudioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
                    expect(audioBuffer.copyFromChannel).to.be.undefined;
                    expect(audioBuffer.copyToChannel).to.be.undefined;

                    done();
                });
            });
        });

        // bug #21

        it('should not return a promise', (done) => {
            loadFixture('1000-frames-of-noise.wav', (err, arrayBuffer) => {
                expect(err).to.be.null;

                expect(offlineAudioContext.decodeAudioData(arrayBuffer, () => {})).to.be.undefined;

                done();
            });
        });

        // bug #26

        it('should throw a synchronous error', (done) => {
            try {
                offlineAudioContext.decodeAudioData(null, () => {});
            } catch (err) {
                done();
            }
        });

    });

    describe('startRendering()', () => {

        // bug #21

        it('should not return a promise', () => {
            expect(offlineAudioContext.startRendering()).to.be.undefined;
        });

    });

});
