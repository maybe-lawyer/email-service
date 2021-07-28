// keyed on email id
const db = {};

const addEmail = (data) => {
  const id = (Math.floor(Math.random() * 10000000)).toString();
  db[id] = data;
  return id;
};

const updateStatus = (id, status) => {
  const email = db[id];
  if (!email) {
    throw new Error('404');
  }
  email.status = status;
  db[id] = email;
  return db[id];
};

const retrieveEmail = (id) => {
  const email = db[id];
  if (!email) {
    return null;
  }
  return email;
};

module.exports = {
  addEmail,
  updateStatus,
  retrieveEmail,
};
