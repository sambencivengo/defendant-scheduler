import { Handler } from 'express';
import logger from '../../logger';
import { Defendant } from '../../models';

export const get: Handler = async (req, res) => {
	// TODO: set up query params so Bekah can filter results based on contact date or scheduled date

	try {
		const defendants = await Defendant.find({});
		res.send(defendants);
	} catch (error) {
		logger.error(error);
		res.status(500).send('Unable to get defendants');
	}
};