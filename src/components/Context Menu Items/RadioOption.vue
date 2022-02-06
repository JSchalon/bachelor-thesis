<template>
    <g>
      
    </g>
</template>

<script>

//TODO: make stuff

/**
 * A custom context menu radio option for the direction signs
 * @displayName RadioOption
 */
export default {
  name: "RadioOption",
  inject: [],
  props: {
    options: Array,
  },
  emits: ["switchState"],
  data() {
    return {
      selectedID: 1,
      
    };
  },
  mounted () {
    
  },
  methods: {
    
  },
  computed: {
    selectedText(id) {
      return this.options[id];
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  
</style>