const paths = ['/', '/de', '/en', '/de/about', '/access', '/de/access'];

function processPath(pathname) {
  // If we are on the access subdomain:
  // We want to serve the /access route.
  // We want to preserve locales.
  
  // Is it already pointing to access?
  // We could just let next-intl run, then if the result is a rewrite, we don't do anything?
}
