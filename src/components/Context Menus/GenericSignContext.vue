<template>
    <g :class="{active : isActive}">
      <RadioOption/>
      <OnOffOption/>
      <SignCategoryContainer/>
      <DeleteOption/>
    </g>
</template>

<script>
import DeleteOption from "../Context Menu Items/DeleteOption.vue"
import OnOffOption from "../Context Menu Items/OnOffOption.vue"
import RadioOption from "../Context Menu Items/RadioOption.vue"
import SignCategoryContainer from "../Context Menu Items/SignCategoryContainer.vue"

//TODO: make stuff

/**
 * The context menu for the generic sign
 * @displayName GenericSignContext
 */
export default {
  name: "GenericSignContext",
  components: {
    DeleteOption,
    OnOffOption,
    RadioOption,
    SignCategoryContainer
  },
  inject: ["contextMenuWidth"],
  props: {
    signData: Object
  },
  emits: ["updateSignData"],
  data() {
    return {
      isActive: true,
    };
  },
  mounted () {
    
  },
  methods: {
    
  },
  computed: {
    
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  
</style>
