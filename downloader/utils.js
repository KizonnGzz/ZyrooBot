// utils.js
import fetch from 'node-fetch';

export const getBuffer = async (url) => {
  const res = await fetch(url);
  return await res.buffer();
};

export const fetchJson = async (url, options) => {
  const res = await fetch(url, options);
  return await res.json();
};