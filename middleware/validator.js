class Validator {
    validateUrl(req, res, next) {
        const { url } = req.body;
        
        if (!url || typeof url !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }

        try {
            new URL(url.trim());
            req.body.url = url.trim();
            next();
        } catch {
            res.status(400).json({
                success: false,
                error: 'Invalid URL format'
            });
        }
    }
}

module.exports = new Validator(); 