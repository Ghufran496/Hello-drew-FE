import axios from 'axios';

const getVoices = async () => {
  return await axios
    .get('https://api.retellai.com/list-voices', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.data);
};

export { getVoices };
