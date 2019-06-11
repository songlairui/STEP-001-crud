import axios from "axios";
import { pluralAPI, singularAPI } from "./fn";

axios.defaults.baseURL = "/api";

const pluralFactory = pluralAPI(axios);
const singularFactory = singularAPI(axios);

export default {
  posts: pluralFactory("posts"),
  comments: pluralFactory("comments"),
  profile: singularFactory("posts")
};
