import express from 'express';

export function catchAllErrors(err: express.ErrorRequestHandler, req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log('------>ERROR!');
    if (err != null)
        res.status(401).json({ message: "Super Error", code: 500 })
}