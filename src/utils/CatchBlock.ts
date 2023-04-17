import { Request, Response, NextFunction } from 'express'

function CatchBlock(fn: Function) {
	return function (req: Request, res: Response, next: NextFunction) {
		fn(req, res, next).catch(next)
	}
}

export default CatchBlock
