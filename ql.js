'use strict';
const axios = require('axios');
const got = require('got');

let strclientid= "",strclientsecret= "",strport="5700";

if (process.env.CHECKCK_STRCLIENTID) {
    strclientid = process.env.CHECKCK_STRCLIENTID;
}
if (process.env.CHECKCK_STRCLIENTSECRET) {
    strclientsecret = process.env.CHECKCK_STRCLIENTSECRET;
}
if (process.env.CHECKCK_PORT) {
    strport = process.env.CHECKCK_PORT;
}

const api = got.extend({
  prefixUrl: 'http://127.0.0.1:'+strport,
  retry: { limit: 0 },
});
async function getToken() {
	var token = "";	
	const response = await axios.get(`http://127.0.0.1:${strport}/open/auth/token`, {
	    params: {
	        client_id: strclientid,
	        client_secret: strclientsecret
	    },
	    headers: {
	        'Accept': 'application/json'
	    }
	});
	
	if (response.status === 200) {
		token = response.data.data.token;
	} else {
		console.error("Error: " + response.status);
	}
	
	return token;

}

module.exports.getEnvs = async () => {  
  const token = await getToken();
  const body = await api({
    url: 'open/envs',
    searchParams: {
      searchValue: 'JD_COOKIE',
      t: Date.now(),
    },
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
  }).json();
  return body.data;
};

module.exports.getEnvsCount = async () => {
  const data = await this.getEnvs();
  return data.length;
};

module.exports.addEnv = async (cookie, remarks) => {
  const token = await getToken();
  const body = await api({
    method: 'post',
    url: 'open/envs',
    params: { t: Date.now() },
    json: [{
      name: 'JD_COOKIE',
      value: cookie,
      remarks,
    }],
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  }).json();
  return body;
};

module.exports.updateEnv = async (cookie, eid, remarks) => {
  const token = await getToken();
  const body = await api({
    method: 'put',
    url: 'open/envs',
    params: { t: Date.now() },
    json: {
      name: 'JD_COOKIE',
      value: cookie,
      _id: eid,
      remarks,
    },
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  }).json();
  return body;
};

module.exports.updateEnv11 = async (cookie, eid, remarks) => {
  const token = await getToken();
  const body = await api({
    method: 'put',
    url: 'open/envs',
    params: { t: Date.now() },
    json: {
      name: 'JD_COOKIE',
      value: cookie,
      id: eid,
      remarks,
    },
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  }).json();
  return body;
};

module.exports.DisableCk = async (eid) => {
  const token = await getToken();
  const body = await api({
    method: 'put',
    url: 'open/envs/disable',
    params: { t: Date.now() },	
    body: JSON.stringify([eid]),
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  }).json();
  return body;
};

module.exports.EnableCk = async (eid) => {
  const token = await getToken();
  const body = await api({
    method: 'put',
    url: 'open/envs/enable',
    params: { t: Date.now() },	
    body: JSON.stringify([eid]),
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  }).json();
  return body;
};

module.exports.getstatus = async(eid) => {
    const envs = await this.getEnvs();
    var tempid = 0;
    for (let i = 0; i < envs.length; i++) {
		tempid = 0;
        if (envs[i]._id) {
            tempid = envs[i]._id;
        }
        if (envs[i].id) {
            tempid = envs[i].id;
        }
        if (tempid == eid) {
            return envs[i].status;
        }
    }
    return 99;
};

module.exports.getEnvById = async(eid) => {
    const envs = await this.getEnvs();
    var tempid = 0;
    for (let i = 0; i < envs.length; i++) {
        tempid = 0;
        if (envs[i]._id) {
            tempid = envs[i]._id;
        }
        if (envs[i].id) {
            tempid = envs[i].id;
        }
        if (tempid == eid) {
            return envs[i].value;
        }
    }
    return "";
};

module.exports.getEnvByPtPin = async (Ptpin) => {
  const envs = await this.getEnvs();
  for (let i = 0; i < envs.length; i++) {	
	var tempptpin = decodeURIComponent(envs[i].value.match(/pt_pin=([^; ]+)(?=;?)/) && envs[i].value.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
	if(tempptpin==Ptpin){		 
		 return envs[i]; 
	  }
  }  
  return "";
};

module.exports.delEnv = async (eid) => {
  const token = await getToken();
  const body = await api({
    method: 'delete',
    url: 'open/envs',
    params: { t: Date.now() },
    body: JSON.stringify([eid]),
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  }).json();
  return body;
};

module.exports.getEnvinfoById = async(eid) => {
    const envs = await this.getEnvs();
    var tempid = 0;
    for (let i = 0; i < envs.length; i++) {
        tempid = 0;
        if (envs[i]._id) {
            tempid = envs[i]._id;
        }
        if (envs[i].id) {
            tempid = envs[i].id;
        }
        if (tempid == eid) {
            return envs[i];
        }
    }
    return null;
};