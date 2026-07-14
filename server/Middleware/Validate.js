import { ZodError } from "zod";

const validate = (schema) => async (req, res, next) => {
    try {
        const parseBody = await schema.parseAsync(req.body);
        req.body = parseBody;
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            // Zod error detected, extract first message
            return next({
                status: 422,
                message: "Fill the Input Properly",
                extraDetails: err.errors[0].message
            });
        }

        // Other (unexpected) error
        next({
            status: 500,
            message: "Internal Server Error",
            extraDetails: err.message || "Unknown error"
        });
    }
};

export default validate;
