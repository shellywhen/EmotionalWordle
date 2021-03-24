<template>
  <div>
    <nav id="nav">
      <router-link to="/">Gallery</router-link>|
      <router-link to="/manual">Static</router-link> |
      <!-- <router-link to="/playground">Playground</router-link> |
      <router-link to="/wave">Wave</router-link> |
      <router-link to="/particle">Particle</router-link> |
      <router-link to="/shaking">Shaking</router-link> | -->
      <router-link to="/interface">Playground</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 0 1vw;
}

#nav {
  padding: 3px 0 12px 0;

  a {
    font-weight: bold;
    color: #2c3e50;
    text-decoration: none;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
