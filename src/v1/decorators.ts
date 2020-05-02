import * as express from "express";
import * as jwt from "jsonwebtoken";
import { Token } from "../models/auth-token";
const Keys = require('../services/keys.json');


//import { too_many_request } from "./mongo";

export function authRequired() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalFunction = descriptor.value;
        descriptor.value = async function (req: express.Request, res: express.Response) {
            try {
                let idToken = req.headers.authorization && req.headers.authorization!.substring(7);
                if (idToken == undefined)
                    throw new Error('Authorization header is missing');

                let decodedToken: Token = verifyIdToken(idToken, 'auctions') as Token;

                /*
                if (decodedToken.sign_in_provider == "anonymous") {
                    throw new Error('Login needed');
                }*/
                if (decodedToken.client_id.length > 21) {
                    res.status(401).json({ message: "Deja de hackear hijo de tu puta madre", code: 401 })
                    return undefined;
                };
                /*if (await too_many_request(decodedToken.uid, 500)) {
                    res.status(401).json(throwError(429));
                    return undefined;
                }*/

                req.headers['x-token'] = decodedToken as any;
                const bindedOriginalFunction = originalFunction.bind(this);
                const result = bindedOriginalFunction(req, res);
                return result;
            } catch (ex) {
                console.log(ex);
                res.status(401).json({ message: "Unauthorize request", code: 401 })
                return undefined;
            }
        };
        return descriptor;
    };
}

export function wrap(fn: any) {
    return function (req: express.Request, res: express.Response, next: express.NextFunction) {
        fn(req, res, next).catch(next);
    };
}

function verifyIdToken(idToken: string, service: string) {
    return jwt.verify(idToken, Keys[service]['public_key'], { algorithms: ["RS256"] });
}