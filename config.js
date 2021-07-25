const {
  EMAIL_API_PORT,
  SNAILGUN_API_KEY,
  SPENDGRID_API_KEY,
  EMAIL_SERVICE_NAME,
  FROM_NAME,
  FROM_EMAIL,
} = process.env;

const SPENDGRID_ENDPOINT = 'https://bw-interviews.herokuapp.com/spendgrid/send_email';
const SNAILGUN_ENDPOINT = 'https://bw-interviews.herokuapp.com/snailgun/emails';

module.exports = {
  API_PORT: EMAIL_API_PORT || '8080',
  EMAIL_SERVICE: EMAIL_SERVICE_NAME || 'spendgrid',
  FROM_NAME,
  FROM_EMAIL,
  SNAILGUN_API_KEY,
  SNAILGUN_ENDPOINT,
  SPENDGRID_API_KEY,
  SPENDGRID_ENDPOINT
};
