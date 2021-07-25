const got = require('got');
const { convert } = require('html-to-text');

const {
  EMAIL_SERVICE,
  SNAILGUN_API_KEY,
  SNAILGUN_ENDPOINT,
  SPENDGRID_API_KEY,
  SPENDGRID_ENDPOINT,
  SNAILGUN_TIMEOUT
} = require('./config');

const parseFieldsForSpendgrid = ({ to, to_name, from, from_name }) => ({
  sender: `${from_name} <${from}>`,
  recipient: `${to_name} <${to}>`
});

const parseFieldsForSnailgun = ({ to, to_name, from, from_name }) => ({
  from_email: from,
  from_name,
  to_email: to,
  to_name,
});

const FIELD_PARSER_MAP = {
  snailgun: parseFieldsForSnailgun,
  spendgrid: parseFieldsForSpendgrid,
};

const parseFields = FIELD_PARSER_MAP[EMAIL_SERVICE];

const validateBody = (fields) => {
  // not implemented, throw error if validation fails
  return true;
};

const createPayload = (requestBody) => {
  validateBody(requestBody);
  const {
    to,
    to_name,
    from,
    from_name,
    subject,
    body
  } = requestBody;
  const textBody = convert(body);
  const toAndFromFields = parseFields({ to, to_name, from, from_name });
  return {
    subject,
    body: textBody,
    ...toAndFromFields,
  };
};

const spendgridHandler = async (req, res) => {
  try {
    const payload = createPayload(req.body);
    const spendgridResponse = await got(SPENDGRID_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': SPENDGRID_API_KEY,
      }
    });
    res.status(spendgridResponse.statusCode);
    res.send({ message: spendgridResponse.body });
  } catch (e) {
    console.log('Spendgrid Failure', e);
    res.status(500);
    res.send(e);
  }
};

const snailgunHandler = async (req, res) => {
  try {
    const payload = createPayload(req.body);
    const snailgunPostResponse = await got(SNAILGUN_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': SNAILGUN_API_KEY,
      }
    });
    res.status(snailgunPostResponse.statusCode);
    res.send(snailgunPostResponse.body);
  } catch (e) {
    console.log('Snailgun Failure', e);
    res.status(500);
    res.send(e);
  }
};

const snailgunStatusHandler = async (req, res) => {
  const emailId = req.params.id;
  const statusResponse = await got(`${SNAILGUN_ENDPOINT}/${emailId}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': SNAILGUN_API_KEY,
    }
  });
  res.status(statusResponse.statusCode);
  res.send(statusResponse.body);
}


const EMAIL_SERVICE_MAP = {
  spendgrid: spendgridHandler,
  snailgun: snailgunHandler,
};

const emailServiceHandler = EMAIL_SERVICE_MAP[EMAIL_SERVICE] || spendgridHandler;

module.exports = {
  spendgridHandler,
  snailgunHandler,
  emailServiceHandler,
  emailStatusHandler: snailgunStatusHandler,
}
