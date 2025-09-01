/**
 * URL validation middleware
 */
export const validateUrl = (req, res, next) => {
  const { url } = req.body;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error: 'Valid URL is required'
    });
  }

  try {
    new URL(url);
    next();
  } catch {
    res.status(400).json({
      error: 'Invalid URL format'
    });
  }
}; 