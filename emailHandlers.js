const got = require('got');
const { convert } = require('html-to-text');
const validator = require("email-validator");

const {
  EMAIL_SERVICE,
  SNAILGUN_API_KEY,
  SNAILGUN_ENDPOINT,
  SPENDGRID_API_KEY,
  SPENDGRID_ENDPOINT,
} = require('./config');

const { addEmail, retrieveEmail, updateStatus } = require('./emailStore');

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
const REQUIRED_FIELDS = [
  'to',
  'to_name',
  'from',
  'from_name',
  'subject',
  'body'
];

const parseFields = FIELD_PARSER_MAP[EMAIL_SERVICE];

const validateBody = (body) => {
  REQUIRED_FIELDS.forEach((field) => {
    if (!body[field]) {
      throw new Error(`Request missing required field ${field}`);
    }
  });

  ['to', 'from'].forEach(field => {
    if (!validator.validate(body[field])) {
      throw new Error(`Invalid email ${body[field]}`);
    }
  })

  return true;
};

const createPayload = (requestBody) => {
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
  let emailId;
  try {
    validateBody(req.body);
    emailId = addEmail(req.body);
    const payload = createPayload(req.body);
    const spendgridResponse = await got(SPENDGRID_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': SPENDGRID_API_KEY,
      }
    });
    updateStatus(emailId, 'sent');
    res.status(spendgridResponse.statusCode);
    res.send({ message: spendgridResponse.body, id: emailId });
  } catch (e) {
    console.log('Spendgrid Failure', e);
    updateStatus(emailId, 'error');
    res.status(500);
    res.send({ error: e, message: e.message });
  }
};

const snailgunHandler = async (req, res) => {
  let emailId;
  try {
    validateBody(req.body);
    emailId = addEmail(req.body);
    const payload = createPayload(req.body);
    const snailgunPostResponse = await got(SNAILGUN_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': SNAILGUN_API_KEY,
      }
    });
    updateStatus(emailId, 'queued');
    res.status(snailgunPostResponse.statusCode);
    res.send(snailgunPostResponse.body);
  } catch (e) {
    console.log('Snailgun Failure', e);
    updateStatus(emailId, 'error');
    res.status(500);
    res.send({ error: e, message: e.message });
  }
};

const getEmail = (req, res) => {
  const { params: { id } } = req;
  const email = retrieveEmail(id);
  // do all the snailgun stuff
  if (!email) {
    res.status(404);
    res.send({});
    return;
  }
  res.status(200);
  res.send(email);
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
};

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
  validateBody,
  createPayload,
  getEmail,
}
