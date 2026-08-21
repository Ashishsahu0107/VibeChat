import { OAuth2Client } from "google-auth-library";

export async function verify() {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  return payload;
}

export const GoogleProtect = async (req, res, next) => {
  try {
    const { idToken, email, id } = req.body;

    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    // console.log(payload);

    if (email !== payload.email || id !== payload.sub) {
      const error = new Error("User Not Verified");
      error.statusCode = 400;
      return next(error);
    }
    next();
  } catch (error) {
    next(error);
  }
};