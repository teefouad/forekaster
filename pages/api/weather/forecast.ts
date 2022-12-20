/**
 * Dependency imports
 */
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Local imports
 */
import api from '../../../services/api';

/**
 * Handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!req.query.city) {
    res.status(410).json({
      error: 'City name is required'
    });
    
    return;
  }

  const weatherData = await api.server.weather.get(req.query.city.toString());
  const forecastData = await api.server.forecast.get(req.query.city.toString(), +(req.query.count ?? 8));

  res.status(200).json({
    weather: weatherData,
    forecast: forecastData,
  });
}
