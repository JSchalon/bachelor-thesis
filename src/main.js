import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

// https://webpack.js.org/guides/dependency-management/#require-context
const requireComponent = require.context(
  './', // Look for files in the current directory
  true, // include subdirectories
  // Only include "_base-" prefixed .vue files
  //   /_base-[\w-]+\.vue$/
  //   /[\w-]+\.vue$/
  /\.vue$/
);

// For each matching file name...
requireComponent.keys().forEach(fileName => {
  // Get the component config
  const componentConfig = requireComponent(fileName);
  const componentName = 
      fileName
        .replace(/^.*[\\/]/, '')  // Remove path
        .replace(/\.\w+$/, '');    // Remove extension

  // Globally register the component
  app.component(componentName, componentConfig.default || componentConfig);
});

app.use(store).use(router).mount('#app')