/**
 * Handles all API calls
 */
const api = {
  weather: {
    get: async (city: string) => {
      const requestURL = `${process.env.API_BASE_URL}weather?q=${city}&appid=${process.env.APP_ID}`;
      const response = await fetch(requestURL);
      const json = await response.json();

      return {
        temp: Math.round(+json.main.temp - 273.15),
        wind: +json.wind.speed * 60 * 60 / 1000,
        weather: json.weather[0],
      };
    },
  },

  forecast: {
    get: async (city: string, count: number = 8) => {
      const requestURL = `${process.env.API_BASE_URL}forecast?q=${city}&appid=${process.env.APP_ID}&cnt=${count}`;
      const response = await fetch(requestURL);
      const json = await response.json();

      return json.list.map((obj: any) => ({
        temp: Math.round(+obj.main.temp - 273.15),
        time: new Date(+obj.dt * 1000),
        weather: obj.weather[0]
      }));
    },
  },

  client: {
    weatherDataForCity: {
      get: async (city: string, forecastCount: number = 8) => {
        const requestURL = `/api/forecast?city=${city}&count=${forecastCount}`;
        const response = await fetch(requestURL);
        const json = await response.json();
        return json;
      },
    },
  },
};

export default api;
