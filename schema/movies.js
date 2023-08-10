const z = require('zod');

const currentTime = new Date();
const year = currentTime.getFullYear();

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is require'
  }),
  year: z.number().int().positive().min(1900).max(year),
  director: z.string(),
  duration: z.number().int().positive(),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'History', 'Thriller', 'Sci-Fi']),
    {
      required_error: 'Movie genre is require',
      invalid_type_error: 'Movie genre must be an array of enum genre'
    }
  ),
  rate: z.number().min(0).max(10).default(0)
});

function validateMovie (input) {
  return movieSchema.safeParse(input);
};

function validateParcialmovie (input) {
  return movieSchema.partial().safeParse(input);
};

module.exports = {
  validateMovie,
  validateParcialmovie
};
