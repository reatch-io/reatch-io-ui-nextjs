import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';

export default handleAuth({
  async callback(req, res) {
    try {
      // Call the default callback first
      await handleCallback(req, res);

      // Get the user session
      const { user } = req.session || {};

      if (user) {
        console.log("User logged in:", user);

        // Execute your custom code here
        // e.g., save user info to your database
      }

      // Redirect after login
      res.writeHead(302, { Location: '/' });
      res.end();
    } catch (error) {
      res.status(error.status || 500).end(error.message);
    }
  },
});