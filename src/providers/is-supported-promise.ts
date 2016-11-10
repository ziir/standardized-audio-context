import { DecodeAudioDataTypeErrorSupportTester } from '../testers/decode-audio-data-type-error-support';
import { MergingSupportTester } from '../testers/merging-support';
import { Modernizr } from './modernizr';
import { OpaqueToken } from '@angular/core';

export const IsSupportedPromise = new OpaqueToken('IS_SUPPORTED_PROMISE'); // tslint:disable-line:variable-name

export const IS_SUPPORTED_PROMISE_PROVIDER = {
    deps: [ DecodeAudioDataTypeErrorSupportTester, MergingSupportTester, Modernizr ],
    provide: IsSupportedPromise,
    useFactory: (decodeAudioDataTypeErrorSupportTester, mergingSupportTester, modernizr): Promise<boolean> => {
        if (modernizr.promises && modernizr.typedarrays && modernizr.webaudio) {
            return Promise
                .all([
                    // @todo decodeAudioDataTypeErrorSupportTester.test(),
                    mergingSupportTester.test()
                ])
                .then(([ /* decodeAudioDataTypeErrorSupport, */ mergingSupport ]) => {
                    return /* decodeAudioDataTypeErrorSupport && */ mergingSupport;
                });
        }

        return Promise.resolve(false);
    }
};
