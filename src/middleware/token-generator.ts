import * as jwt from 'jsonwebtoken';
import { Token } from '../models/auth-token';
import * as fs from "fs";
import * as path from "path";

interface Keys {
    PUBLIC_KEY?: string;
    PRIVATE_KEY?: string;
}

export const Key: Keys = {};


class TokenGenerator {
    secretOrPublicKey: string;
    secretOrPrivateKey: string;
    options: any;

    constructor(secretOrPrivateKey: string, secretOrPublicKey: string, options: any) {
        this.secretOrPrivateKey = secretOrPrivateKey;
        this.secretOrPublicKey = secretOrPublicKey;
        this.options = options; //algorithm + keyid + noTimestamp + expiresIn + notBefore
    }

    sign(payload: any, signOptions: any): string {
        const jwtSignOptions = Object.assign({}, signOptions, this.options);
        //console.log(this.secretOrPrivateKey);
        try {
            return jwt.sign(payload, this.secretOrPrivateKey, jwtSignOptions);
        } catch (e) {
            console.log(e);
            return '';
        }
    }

    // refreshOptions.verify = options you would use with verify function
    // refreshOptions.jwtid = contains the id for the new token
    refresh(token: string, refreshOptions: any) {
        const payload = jwt.verify(token, this.secretOrPublicKey, refreshOptions.verify) as Token;
        delete payload.iat;
        delete payload.exp;
        const jwtSignOptions = Object.assign({}, this.options, { jwtid: refreshOptions.jwtid });
        // The first signing converted all needed options into claims, they are already in the payload
        return jwt.sign(payload, this.secretOrPrivateKey, jwtSignOptions);
    }
}


Key.PRIVATE_KEY = fs.readFileSync(path.join(__dirname, "../../../util/keys/private.key"), "UTF8")
Key.PUBLIC_KEY = fs.readFileSync(path.join(__dirname, "../../../util/keys/public.key"), "UTF8")
//console.log(Key.PRIVATE_KEY);
export const tokengenerator = new TokenGenerator(Key.PRIVATE_KEY, Key.PUBLIC_KEY, { algorithm: "RS256" });


