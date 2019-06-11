<template>
  <div class="home">
    <h1 @click="test.a()">Welcome to Your Vue.js App</h1>
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
            <button @click="deletePost(post)">delete</button>
          </li>
        </ul>
        <div class="update-form" v-if="form.updatePost.id">
          <h4>Update a Post</h4>
          <input type="text" v-model="form.updatePost.title" placeholder="title">
          <input type="text" v-model="form.updatePost.author" placeholder="author">
          <button @click="updatePost()">Update</button>
        </div>
        <div class="create-form">
          <h4>Create a Post</h4>
          <input type="text" v-model="form.newPost.title" placeholder="title">
          <input type="text" v-model="form.newPost.author" placeholder="author">
          <button @click="createPost$F()">Create</button>
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
    create: ["createPost", "refreshPost"],
    update: ["updatePost", "updatePostItem"],
    delete: ["deletePost", "deleteLocal"]
  }
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
        newPost: {
          title: "",
          author: ""
        },
        updatePost: {
          id: "",
          title: "",
          author: ""
        }
      },
      test: {
        a() {
          console.info("test", this);
        }
      }
    };
  },
  computed: {
    createPost$F() {
      return () =>
        flows.post.create.reduce(
          (result, propName) => result.then(() => this[propName]()),
          Promise.resolve()
        );
    }
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
    async createPost() {
      const post = { ...this.form.newPost };
      await API.posts.create(post);
      this.form.newPost = {
        title: "",
        author: ""
      };
    },
    async updatePost() {
      // 全量更新
      const { id, ...post } = this.form.updatePost;
      await API.posts.update(id, post);
      this.form.updatePost = {
        id: "",
        title: "",
        author: ""
      };
    },
    selectEdit(post) {
      const { id, title, author } = post;
      this.form.updatePost = { id, title, author };
    },
    deletePostLocal(post) {
      const idx = this.posts.findIndex(item => item.id === post.id);
      if (idx > -1) {
        this.posts.splice(idx, 1);
        return true;
      }
      return false;
    },
    async deletePost(post) {
      await API.posts.delete(post.id);
    },
    async refreshPostItem(post) {
      try {
        const data = await API.posts.retrieve(post.id);
        console.info("data", data);
      } catch (error) {
        if ((error.response && error.response.status) === 404) {
          const idx = this.posts.findIndex(item => item.id === post.id);
          if (idx > -1) {
            this.posts.splice(idx, 1);
          }
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
    this.test.a();
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
