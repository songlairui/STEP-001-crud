<template>
  <div class="home">
    <h1>Welcome to Your Vue.js App</h1>
    <div class="row">
      <div class="col">
        <h3>
          POSTS
          <button @click="refreshPost()">refresh</button>
        </h3>
        <ul>
          <li v-for="(post,idx) in posts" :key="idx">
            <button @click="refreshPostItem(post)">refreshItem</button>
            <span class="id var">{{post.id}}</span>
            <span class="title var">{{post.title}}</span>
            <span class="author var">{{post.author}}</span>
            <button @click="selectEdit(post)">Edit</button>
            <button @click="deletePost_flow(post)">delete</button>
          </li>
        </ul>
        <div class="update-form" v-if="form.updatePost.id">
          <h4>Update a Post</h4>
          <div class="input-item" v-for="(_, key) in form.newPost" :key="key">
            <input type="text" v-model="form.updatePost[key]" :placeholder="key">
          </div>
          <button @click="patchPost_flow()">Patch</button>
          <button @click="updatePost_flow()">Update</button>
          <button @click="abortUpdate()">Abort</button>
        </div>
        <div class="create-form">
          <h4>Create a Post</h4>
          <div class="input-item" v-for="(_, key) in form.newPost" :key="key">
            <input type="text" v-model="form.newPost[key]" :placeholder="key">
          </div>
          <button @click="createPost_flow()">Create</button>
        </div>
      </div>
      <div class="col">
        <h3>
          COMMENTS
          <button @click="refreshComment()">refresh</button>
        </h3>
        <pre>{{comments}}</pre>
      </div>
      <div class="col">
        <h3>
          PROFILE
          <button @click="refreshProfile()">refresh</button>
        </h3>
        <pre>{{profile}}</pre>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import API from "@/api";

const flows = {
  post: {
    create: ["createPost", "refreshPost", "abortPost"],
    update: ["updatePost", "refreshPostItem", "abortUpdate"],
    patch: ["patchPost", "refreshPostItem", "abortUpdate"],
    delete: ["deletePost", "deletePostLocal"]
  }
};

const flowGenerator = flowItems =>
  function() {
    // computed
    return function(data) {
      // targetFn
      return flowItems.reduce(
        (result, propName) =>
          result.then(resolved => {
            const endData = resolved === undefined ? data : resolved;
            return this[propName](endData);
          }),
        Promise.resolve()
      );
    };
  };

const defaultPostInput = {
  title: "",
  author: ""
};

export default {
  name: "home",
  components: {
    HelloWorld
  },
  data() {
    return {
      posts: [],
      comments: [],
      profile: {},
      form: {
        newPost: { ...defaultPostInput },
        updatePost: {
          _origin: {}, // TODO
          id: "",
          ...defaultPostInput
        }
      }
    };
  },
  computed: {
    createPost_flow: flowGenerator(flows.post.create),
    updatePost_flow: flowGenerator(flows.post.update),
    patchPost_flow: flowGenerator(flows.post.patch),
    deletePost_flow: flowGenerator(flows.post.delete)
  },
  methods: {
    async refreshPost() {
      this.posts = await API.posts.list();
    },
    async refreshComment() {
      this.comments = await API.comments.list();
    },
    async refreshProfile() {
      this.profile = await API.profile.retrieve();
    },
    abortPost() {
      this.form.newPost = { ...defaultPostInput };
    },
    async createPost() {
      const post = { ...this.form.newPost };
      await API.posts.create(post);
    },
    selectEdit(post) {
      const { id, title, author } = post;
      this.form.updatePost = { id, title, author };
    },
    async deletePost(post) {
      await API.posts.delete(post.id);
    },
    deletePostLocal(post) {
      const idx = this.posts.findIndex(item => item.id === post.id);
      if (idx > -1) {
        this.posts.splice(idx, 1);
        return true;
      }
      return false;
    },
    abortUpdate() {
      this.form.updatePost = {
        id: "",
        ...defaultPostInput
      };
    },
    async patchPost() {
      // 全量更新
      const { id, ...post } = this.form.updatePost;
      Object.entries(post).forEach(([key, value]) => {
        if (value === undefined || value.trim() === "") {
          delete post[key];
        }
      });
      await API.posts.patch(id, post);
      return { id, ...post };
    },
    async updatePost() {
      // 全量更新
      const { id, ...post } = this.form.updatePost;
      await API.posts.update(id, post);
      return { id, ...post };
    },
    async refreshPostItem(post) {
      const idx = this.posts.findIndex(item => item.id === post.id);
      if (idx === -1) {
        console.error(" no achieveable");
        return;
      }
      try {
        const data = await API.posts.retrieve(post.id);
        this.posts.splice(idx, 1, { ...data });
      } catch (error) {
        if ((error.response && error.response.status) === 404) {
          const idx = this.posts.findIndex(item => item.id === post.id);
          this.posts.splice(idx, 1);
        } else console.dir(error);
      }
    },
    async init() {
      const [posts, comments, profile] = await Promise.all([
        API.posts.list(),
        API.comments.list(),
        API.profile.retrieve()
      ]);
      Object.assign(this, {
        posts,
        comments,
        profile
      });
    }
  },
  async created() {
    await this.init();
  }
};
</script>
<style lang="less">
span.var {
  display: inline-block;
  padding: 0.2em 0.3em;
}
</style>

<style lang="less" scoped>
.row {
  display: flex;
  justify-content: space-evenly;
}
</style>
