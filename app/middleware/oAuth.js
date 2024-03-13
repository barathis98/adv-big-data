// import { Axios } from "axios";

export const oAuth = async (req, res, next) => {
    const accessToken = req.headers['authorization'];
    if (!accessToken) {
        return res.status(401).json({ error: 'No access token provided' });
      }
      const token = accessToken.split(' ')[1]; 
    //   console.log('token:', token)
      try {
        const tokenInfo = await verifyToken(token);
        if (tokenInfo.status === 200) {
            next();
          } else {
            throw new Error('Token verification failed');
          }      
        } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
      }
}

const verifyToken = async (accessToken) => {
    try {
        // console.log('accessToken:', accessToken);
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`, {
            method: 'GET'
          });      
        //   console.log('response:', response);
      return response;
    } catch (error) {
      console.error('Error verifying token:', error.response.data);
      throw new Error('Failed to verify token');
    }
  };