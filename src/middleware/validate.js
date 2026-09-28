// Validates req.body / req.query / req.params with a zod schema.
// On success the parsed (clean, typed) data replaces the original.
export const validate =
  (schema, source = "body") =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    req[source] = result.data;
    next();
  };
