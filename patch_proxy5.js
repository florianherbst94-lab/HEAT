// OK, the user says Vercel is NOT building the pushes! 
// Why would a git push to `main` not trigger a Vercel build?
// Vercel only triggers builds automatically if the GitHub repository is correctly linked to the Vercel project.
// If the user's Vercel project `heat-app` is NOT linked to the GitHub repo `florianherbst94-lab/HEAT`, 
// or if Vercel webhooks are disabled, pushes won't trigger builds.
// Or if the Vercel project is linked to a DIFFERENT branch (not `main`).
// Or if Vercel is linked to a different GitHub repository.
// Let's ask the user to verify the GitHub connection in Vercel.
