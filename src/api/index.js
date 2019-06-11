import axios from "axios";
import { pluralAPI, singularAPI } from "./fn";

const xhttp = axios.create();

xhttp.defaults.baseURL = "/api";

xhttp.interceptors.response.use(response => {
  const { status, data } = response;
  if (status >= 200 && status < 300) {
    return Promise.resolve(data);
  } else {
    return Promise.reject(response);
  }
});

const pluralFactory = pluralAPI(xhttp);
const singularFactory = singularAPI(xhttp);

export default {
  posts: pluralFactory("posts"),
  comments: pluralFactory("comments"),
  profile: singularFactory("profile")
};
