
type errorCodes = 401 | 400 | 404 | 429
export function throwError(number: errorCodes, error: any = null) {
    let errors = {
        400: {
            "number": number,
            "status": 400,
            "error_type": "InvalidRequestException",
            "error_msg": "Invalid Request"
        },
        401: {
            "number": number,
            "status": 401,
            "error_type": "UnauthorizedException",
            "error_msg": "Unauthorized Request"
        },
        404: {
            "number": number,
            "status": 404,
            "error_type": "NotFoundEndpointException",
            "error_msg": "Not Found Endpoint"
        },
        429: {
            "number": number,
            "status": 429,
            "error_type": "OAuthRateLimitException",
            "error_msg": "You made too many requests in 15 min"
        }
    }
    if (error != null) {
        errors[number]['error_msg'] = error
    }
    return errors[number];
}

export function getTimeinSec() {
    return Math.floor(new Date().getTime() / 1000);
}

export function removeAcento(input: string) {
    // Cadena de caracteres original a sustituir.
    let original = "áàäêéèëíìïóòöúùuñÁÀÄÉÈËÍÌÏÓÒÖÚÙÜÑçÇ";
    // Cadena de caracteres ASCII que reemplazarán los originales.
    let ascii = "aaaeeeeiiiooouuunAAAEEEIIIOOOUUUNcC";
    let output = input;
    for (let i = 0; i < original.length; i++) {
        // Reemplazamos los caracteres especiales.
        output = output.replace(original.charAt(i), ascii.charAt(i));
    }
    return output;
}

export class PushID {
    // Modeled after base64 web-safe chars, but ordered by ASCII.
    PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

    // Timestamp of last push, used to prevent local collisions if you push twice in one ms.
    lastPushTime = 0;

    // We generate 72-bits of randomness which get turned into 12 characters and appended to the
    // timestamp to prevent collisions with other clients.  We store the last characters we
    // generated because in the event of a collision, we'll use those same characters except
    // "incremented" by one.
    lastRandChars: number[] = [];

    next(length = 20) {
        // 12
        let computeTotal = length - 8;
        let now = new Date().getTime();
        let duplicateTime = (now === this.lastPushTime);
        this.lastPushTime = now;

        let timeStampChars = new Array(8);
        for (let i = 7; i >= 0; i--) {
            timeStampChars[i] = this.PUSH_CHARS.charAt(now % 64);
            // NOTE: Can't use << here because javascript will convert to int and lose the upper bits.
            now = Math.floor(now / 64);
        }
        if (now !== 0) throw new Error('We should have converted the entire timestamp.');

        let id = timeStampChars.join('');
        let i;
        if (!duplicateTime) {
            for (i = 0; i < computeTotal; i++) {
                this.lastRandChars[i] = Math.floor(Math.random() * 64);
            }
        } else {
            // If the timestamp hasn't changed since last push, use the same random number, except incremented by 1.
            for (i = computeTotal - 1; i >= 0 && this.lastRandChars[i] === 63; i--) {
                this.lastRandChars[i] = 0;
            }
            this.lastRandChars[i]++;
        }
        for (i = 0; i < computeTotal; i++) {
            id += this.PUSH_CHARS.charAt(this.lastRandChars[i]);
        }
        //if (id.length != 20) throw new Error('Length should be 20.');

        return id;
    };
};